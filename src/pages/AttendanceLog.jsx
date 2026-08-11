import { useEffect, useState } from 'react';
import Badge from '../components/Badge';
import { supabase } from '../lib/supabase';
import './AttendanceLog.css';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function initialsOf(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export default function AttendanceLog() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [filters, setFilters] = useState({ date: todayISO(), class: '', status: '' });
  const [applied, setApplied] = useState({ date: todayISO(), class: '', status: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const start = new Date(`${applied.date}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    supabase
      .from('attendance_logs')
      .select('id, created_at, name, class, roll, confidence, status, logged_by')
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setRows(data || []);
        setLoading(false);
      });
  }, [applied.date]);

  const filtered = rows.filter((r) => {
    const matchClass = !applied.class || String(r.class) === applied.class;
    const matchStatus = !applied.status || r.status === applied.status;
    return matchClass && matchStatus;
  });

  return (
    <div className="page-wrapper">
      <div className="page-top-bar">
        <h1>Attendance Log</h1>
      </div>

      {/* Filters */}
      <div className="card att-filters">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={filters.date}
            onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
            style={{ maxWidth: 180 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Class</label>
          <select className="form-select" style={{ maxWidth: 160 }}
            value={filters.class}
            onChange={(e) => setFilters((f) => ({ ...f, class: e.target.value }))}>
            <option value="">All Classes</option>
            {['8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" style={{ maxWidth: 200 }}
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All</option>
            <option value="Verified">Verified</option>
            <option value="Unknown Face">Unknown Face</option>
          </select>
        </div>
        <button className="btn-primary att-filter-btn"
          onClick={() => { setLoading(true); setApplied({ ...filters }); }}>
          Apply Filters
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="att-table-header">
          <span className="section-title" style={{ marginBottom: 0 }}>
            Recognition Events
          </span>
          <span className="text-muted text-sm">{loading ? 'Loading…' : `${filtered.length} records`}</span>
        </div>
        <div className="divider" style={{ margin: '12px 0' }} />
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Roll No.</th>
                <th>Match Confidence</th>
                <th>Status</th>
                <th>Logged By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td className="text-muted text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(row.created_at)}
                  </td>
                  <td>
                    <div className="row-name-cell">
                      <div className={`avatar ${row.name === 'Unknown' ? 'att-unknown-avatar' : ''}`}>
                        {initialsOf(row.name)}
                      </div>
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td>{row.class ? `Class ${row.class}` : '—'}</td>
                  <td className="text-muted">{row.roll || '—'}</td>
                  <td>
                    <span className={`confidence-score ${row.confidence < 70 ? 'low' : ''}`}>
                      {row.confidence}%
                    </span>
                  </td>
                  <td><Badge label={row.status} /></td>
                  <td className="text-muted text-sm">{row.logged_by}</td>
                  <td>
                    <span className="link" onClick={() => setSelectedRow(row)}>View</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <p className="text-muted text-sm" style={{ padding: '16px 0', textAlign: 'center' }}>
              No attendance records for this date.
            </p>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedRow && (
        <div className="att-modal-overlay" onClick={() => setSelectedRow(null)}>
          <div className="att-modal card" onClick={(e) => e.stopPropagation()}>
            <div className="att-modal__header">
              <h3 className="font-semibold" style={{ fontSize: 16 }}>Event Details</h3>
              <button className="att-modal__close" onClick={() => setSelectedRow(null)}>✕</button>
            </div>
            <div className="divider" style={{ margin: '12px 0' }} />
            <div className="confirm-summary">
              {[
                ['Timestamp', formatTime(selectedRow.created_at)],
                ['Student Name', selectedRow.name],
                ['Class', selectedRow.class ? `Class ${selectedRow.class}` : '—'],
                ['Roll No.', selectedRow.roll || '—'],
                ['Match Confidence', `${selectedRow.confidence}%`],
                ['Status', selectedRow.status],
                ['Logged By', selectedRow.logged_by],
              ].map(([label, val]) => (
                <div className="confirm-row" key={label}>
                  <span className="confirm-row__label text-muted text-sm">{label}</span>
                  <span className="confirm-row__value font-medium">{val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button className="btn-secondary" onClick={() => setSelectedRow(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
