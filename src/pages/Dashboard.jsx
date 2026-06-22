import { Users, UserCheck, UserX, TrendingUp, Video } from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { liveEvents, classSummary } from '../data/mockData';
import './Dashboard.css';

const STATS = [
  { value: '847',   label: 'Total Students',   Icon: Users },
  { value: '731',   label: 'Present Today',    Icon: UserCheck },
  { value: '116',   label: 'Absent',           Icon: UserX },
  { value: '94.2%', label: 'Attendance Rate',  Icon: TrendingUp, accent: true },
];

export default function Dashboard() {
  return (
    <div className="page-wrapper">
      {/* Stat row */}
      <div className="dashboard-stats">
        {STATS.map((c) => (
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
            <div className="camera-monitor__inner">
              <div className="camera-monitor__icon">
                <Video size={28} strokeWidth={1.5} />
              </div>
              <p className="camera-monitor__label">Camera Feed Active</p>
              <p className="camera-monitor__sub">Gate A — Main Entrance</p>
            </div>
            <div className="camera-scanline" />
          </div>

          {/* Recognition events */}
          <div className="feed-events-wrap">
            <p className="feed-events-label text-muted text-xs">Recent recognitions</p>
            <div className="feed-events">
              {liveEvents.map((e) => (
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
              ))}
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
                {classSummary.map((row) => (
                  <tr key={row.className}>
                    <td className="font-medium">{row.className}</td>
                    <td className="text-muted">{row.total}</td>
                    <td>{row.present}</td>
                    <td>
                      <div className="class-rate-cell">
                        <span className="class-rate-pct">{row.pct}</span>
                        <div className="class-rate-bar">
                          <div
                            className="class-rate-bar__fill"
                            style={{ width: row.pct }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick summary strip */}
          <div className="summary-strip">
            <div className="summary-strip__item">
              <span className="summary-strip__value">847</span>
              <span className="text-muted text-xs">enrolled</span>
            </div>
            <div className="summary-strip__divider" />
            <div className="summary-strip__item">
              <span className="summary-strip__value">731</span>
              <span className="text-muted text-xs">present</span>
            </div>
            <div className="summary-strip__divider" />
            <div className="summary-strip__item">
              <span className="summary-strip__value" style={{ color: '#2563EB' }}>94.2%</span>
              <span className="text-muted text-xs">avg rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
