import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import { healthMetrics, confidenceData, alertLogs } from '../data/mockData';
import './SystemHealth.css';

export default function SystemHealth() {
  return (
    <div className="page-wrapper">
      <div className="page-top-bar">
        <h1>System Health Monitor</h1>
      </div>

      {/* Status banner */}
      <div className="health-banner">
        <CheckCircle2 size={18} strokeWidth={2} />
        <span>System Operating Normally — Recognition confidence above threshold</span>
      </div>

      {/* Metric cards */}
      <div className="health-metrics">
        {healthMetrics.map((m) => (
          <div className="card health-metric" key={m.label}>
            <div className="health-metric__value">{m.value}</div>
            <div className="health-metric__label text-muted text-sm">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card health-chart-card">
        <h2 className="section-title">Confidence Score — Today (6 AM to 10 AM)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={confidenceData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: '#64748B', fontFamily: 'Inter' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tick={{ fontSize: 12, fill: '#64748B', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, 'Confidence']}
              contentStyle={{
                fontFamily: 'Inter',
                fontSize: 13,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alert log */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="section-title">Low Confidence Events</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Confidence</th>
                <th>Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {alertLogs.map((row) => (
                <tr key={row.time}>
                  <td className="text-muted text-sm">{row.time}</td>
                  <td>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>{row.confidence}</span>
                  </td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
