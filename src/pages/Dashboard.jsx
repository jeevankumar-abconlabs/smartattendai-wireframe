import { useEffect, useRef, useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import WebcamCapture from '../components/WebcamCapture';
import { supabase } from '../lib/supabase';
import { buildMatcher, confidenceFromDistance, detectSingleDescriptor, loadModels } from '../lib/faceRecognition';
import './Dashboard.css';

const DETECT_INTERVAL_MS = 1500;
const MAX_LIVE_EVENTS = 8;

function initialsOf(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function Dashboard() {
  const videoRef = useRef(null);
  const matcherRef = useRef(null);
  const studentsRef = useRef([]);
  const loggedTodayRef = useRef(new Set());
  const detectingRef = useRef(false);

  const [students, setStudents] = useState([]);
  const [presentIds, setPresentIds] = useState(() => new Set());
  const [liveEvents, setLiveEvents] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await loadModels();
      const { start, end } = todayRange();

      const [{ data: studentRows }, { data: todayLogs }] = await Promise.all([
        supabase.from('students').select('id, name, class, roll, face_descriptor'),
        supabase.from('attendance_logs').select('student_id').gte('created_at', start).lt('created_at', end),
      ]);
      if (cancelled) return;

      const allStudents = studentRows || [];
      studentsRef.current = allStudents;
      matcherRef.current = buildMatcher(allStudents);
      loggedTodayRef.current = new Set((todayLogs || []).map((l) => l.student_id).filter(Boolean));

      setStudents(allStudents);
      setPresentIds(new Set(loggedTodayRef.current));
      setReady(true);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  async function runDetection() {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || detectingRef.current) return;
    detectingRef.current = true;
    try {
      const descriptor = await detectSingleDescriptor(video);
      if (!descriptor || !matcherRef.current) return;

      const match = matcherRef.current.findBestMatch(descriptor);
      if (match.label === 'unknown') return;

      const studentId = match.label;
      if (loggedTodayRef.current.has(studentId)) return;

      const student = studentsRef.current.find((s) => s.id === studentId);
      if (!student) return;

      loggedTodayRef.current.add(studentId);
      const confidence = confidenceFromDistance(match.distance);
      const now = new Date();

      const { error } = await supabase.from('attendance_logs').insert({
        student_id: student.id,
        name: student.name,
        class: student.class,
        roll: student.roll,
        confidence,
        status: 'Verified',
        logged_by: 'Camera',
      });
      if (error) {
        loggedTodayRef.current.delete(studentId); // allow retry next tick
        return;
      }

      setPresentIds(new Set(loggedTodayRef.current));
      setLiveEvents((prev) => [
        {
          id: `${studentId}-${now.getTime()}`,
          name: student.name,
          initials: initialsOf(student.name),
          class: student.class ? `Class ${student.class}` : '—',
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          status: 'Verified',
        },
        ...prev,
      ].slice(0, MAX_LIVE_EVENTS));
    } finally {
      detectingRef.current = false;
    }
  }

  useEffect(() => {
    if (!ready) return undefined;
    const timer = setInterval(runDetection, DETECT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ready]);

  const total = students.length;
  const presentCount = presentIds.size;
  const absent = Math.max(0, total - presentCount);
  const rate = total > 0 ? Math.round((presentCount / total) * 1000) / 10 : 0;

  const stats = [
    { value: String(total), label: 'Total Students', Icon: Users },
    { value: String(presentCount), label: 'Present Today', Icon: UserCheck },
    { value: String(absent), label: 'Absent', Icon: UserX },
    { value: `${rate}%`, label: 'Attendance Rate', Icon: TrendingUp, accent: true },
  ];

  const classSummary = Object.values(
    students.reduce((acc, s) => {
      const key = s.class || 'Unassigned';
      acc[key] ??= { className: key === 'Unassigned' ? key : `Class ${key}`, total: 0, present: 0 };
      acc[key].total += 1;
      if (presentIds.has(s.id)) acc[key].present += 1;
      return acc;
    }, {})
  );

  let cameraStatus = 'Loading face recognition…';
  if (ready) cameraStatus = total === 0 ? 'No students enrolled yet' : '';

  return (
    <div className="page-wrapper">
      {/* Stat row */}
      <div className="dashboard-stats">
        {stats.map((c) => (
          <StatCard key={c.label} value={c.value} label={c.label} Icon={c.Icon} accent={c.accent} />
        ))}
      </div>

      {/* Two-column panels */}
      <div className="dashboard-panels">
        {/* Live feed */}
        <div className="card dashboard-feed">
          <div className="feed-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>Gate Camera</h2>
            <div className="feed-live-badge">
              <span className="feed-live-dot" />
              LIVE
            </div>
          </div>

          {/* Camera monitor */}
          <div className="camera-monitor">
            <WebcamCapture ref={videoRef} />
            {cameraStatus && <div className="camera-monitor__status">{cameraStatus}</div>}
          </div>

          {/* Recognition events */}
          <div className="feed-events-wrap">
            <p className="feed-events-label text-muted text-xs">Recent recognitions</p>
            <div className="feed-events">
              {liveEvents.length === 0 ? (
                <p className="text-muted text-sm" style={{ padding: '8px 0' }}>No recognitions yet.</p>
              ) : (
                liveEvents.map((e) => (
                  <div className="feed-event" key={e.id}>
                    <div className="feed-event__timeline">
                      <div className="feed-event__dot" />
                    </div>
                    <div className="avatar">{e.initials}</div>
                    <div className="feed-event__info">
                      <span className="feed-event__name">{e.name}</span>
                      <span className="text-muted text-xs">{e.class}</span>
                    </div>
                    <div className="feed-event__right">
                      <span className="feed-event__time text-muted text-xs">{e.time}</span>
                      <Badge label={e.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Class summary */}
        <div className="card dashboard-summary">
          <h2 className="section-title">Today by Class</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total</th>
                  <th>Present</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {classSummary.map((row) => {
                  const pct = row.total > 0 ? Math.round((row.present / row.total) * 100) : 0;
                  return (
                    <tr key={row.className}>
                      <td className="font-medium">{row.className}</td>
                      <td className="text-muted">{row.total}</td>
                      <td>{row.present}</td>
                      <td>
                        <div className="class-rate-cell">
                          <span className="class-rate-pct">{pct}%</span>
                          <div className="class-rate-bar">
                            <div className="class-rate-bar__fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick summary strip */}
          <div className="summary-strip">
            <div className="summary-strip__item">
              <span className="summary-strip__value">{total}</span>
              <span className="text-muted text-xs">enrolled</span>
            </div>
            <div className="summary-strip__divider" />
            <div className="summary-strip__item">
              <span className="summary-strip__value">{presentCount}</span>
              <span className="text-muted text-xs">present</span>
            </div>
            <div className="summary-strip__divider" />
            <div className="summary-strip__item">
              <span className="summary-strip__value" style={{ color: '#2563EB' }}>{rate}%</span>
              <span className="text-muted text-xs">avg rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
