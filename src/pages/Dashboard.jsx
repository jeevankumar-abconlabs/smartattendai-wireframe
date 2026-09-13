import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCcw, Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import WebcamCapture from '../components/WebcamCapture';
import { supabase } from '../lib/supabase';
import { captureFrame } from '../lib/camera';
import { recognizeFace } from '../lib/api';
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
  const boxCanvasRef = useRef(null);
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
      const { start, end } = todayRange();

      const [{ data: studentRows }, { data: todayLogs }] = await Promise.all([
        supabase.from('students').select('id, name, class, roll'),
        supabase.from('attendance_logs').select('student_id').gte('created_at', start).lt('created_at', end),
      ]);
      if (cancelled) return;

      const allStudents = studentRows || [];
      studentsRef.current = allStudents;
      loggedTodayRef.current = new Set((todayLogs || []).map((l) => l.student_id).filter(Boolean));

      setStudents(allStudents);
      setPresentIds(new Set(loggedTodayRef.current));
      setReady(true);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Draws (or clears) the face box on the overlay canvas. The bbox from the
  // backend is in the raw captured frame's coordinate space, but the video
  // is displayed mirrored (CSS scaleX(-1)) and cropped via object-fit: cover
  // — so a naive 1:1 coordinate copy would show the box in the wrong place.
  // We replicate the "cover" scale/crop math ourselves, then mirror just the
  // box's X position (not the canvas itself, so the label text stays readable).
  const drawFaceBox = useCallback((result) => {
    const video = videoRef.current;
    const canvas = boxCanvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!result?.bbox) return;

    const videoAspect = video.videoWidth / video.videoHeight;
    const canvasAspect = canvas.width / canvas.height;
    let scale, offsetX = 0, offsetY = 0;
    if (videoAspect > canvasAspect) {
      scale = canvas.height / video.videoHeight;
      offsetX = (video.videoWidth - canvas.width / scale) / 2;
    } else {
      scale = canvas.width / video.videoWidth;
      offsetY = (video.videoHeight - canvas.height / scale) / 2;
    }

    const [vx1, vy1, vx2, vy2] = result.bbox;
    const cx1 = (vx1 - offsetX) * scale;
    const cx2 = (vx2 - offsetX) * scale;
    const y1 = (vy1 - offsetY) * scale;
    const y2 = (vy2 - offsetY) * scale;
    // mirror X to match the mirrored video, without mirroring the canvas itself
    const x1 = canvas.width - cx2;
    const x2 = canvas.width - cx1;

    const color = result.status === 'matched' ? '#22C55E' : '#EF4444';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    const label = result.status === 'matched' ? `${result.name} (${result.confidence}%)` : 'Unknown';
    ctx.font = '600 13px sans-serif';
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = color;
    ctx.fillRect(x1, Math.max(0, y1 - 20), textWidth + 8, 20);
    ctx.fillStyle = '#0F172A';
    ctx.fillText(label, x1 + 4, Math.max(14, y1 - 5));
  }, []);

  // Face detection + matching now happens in the FastAPI backend (backend/main.py),
  // which also writes the attendance_logs row itself — this just reflects the result in the UI.
  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || detectingRef.current) return;
    detectingRef.current = true;
    try {
      const canvas = captureFrame(video);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
      if (!blob) return;

      const result = await recognizeFace(blob);
      drawFaceBox(result);
      if (result.status !== 'matched' || result.already_logged_today) return;

      const student = studentsRef.current.find((s) => s.id === result.student_id);
      if (!student) return;

      loggedTodayRef.current.add(student.id);
      setPresentIds(new Set(loggedTodayRef.current));
      setLiveEvents((prev) => [
        {
          id: `${student.id}-${Date.now()}`,
          name: student.name,
          initials: initialsOf(student.name),
          class: student.class ? `Class ${student.class}` : '—',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          status: 'Verified',
        },
        ...prev,
      ].slice(0, MAX_LIVE_EVENTS));
    } catch {
      // backend hiccup or camera not ready yet — just skip this tick, next interval retries
    } finally {
      detectingRef.current = false;
    }
  }, [drawFaceBox]);

  useEffect(() => {
    if (!ready) return undefined;
    const timer = setInterval(runDetection, DETECT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ready, runDetection]);

  // Testing utility: wipes today's attendance_logs so "Present Today" goes back to 0
  // without waiting for the date to roll over.
  async function resetToday() {
    if (!window.confirm("Reset today's attendance? This deletes today's attendance log rows.")) return;
    const { start, end } = todayRange();
    await supabase.from('attendance_logs').delete().gte('created_at', start).lt('created_at', end);
    loggedTodayRef.current = new Set();
    setPresentIds(new Set());
    setLiveEvents([]);
  }

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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button className="btn-secondary" onClick={resetToday} title="Testing only: clears today's attendance">
          <RotateCcw size={13} strokeWidth={2.5} />
          Reset Today (testing)
        </button>
      </div>

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
            <canvas className="camera-monitor__box-canvas" ref={boxCanvasRef} />
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
