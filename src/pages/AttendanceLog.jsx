import { useState } from 'react';
import Badge from '../components/Badge';
import { attendanceLogs } from '../data/mockData';
import './AttendanceLog.css';

export default function AttendanceLog() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [filters, setFilters] = useState({ class: '', status: '' });
  const [applied, setApplied] = useState({ class: '', status: '' });

  const filtered = attendanceLogs.filter((r) => {
    const matchClass = !applied.class || r.class.startsWith(applied.class + '-') || r.class === applied.class;
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
          <input type="date" className="form-input" defaultValue="2026-06-22"
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
            <option value="Manual Override">Manual Override</option>
          </select>
        </div>
        <button className="btn-primary att-filter-btn"
          onClick={() => setApplied({ ...filters })}>
          Apply Filters
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="att-table-header">
          <span className="section-title" style={{ marginBottom: 0 }}>
            Recognition Events
          </span>
          <span className="text-muted text-sm">{filtered.length} records</span>
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
                    {row.time}
                  </td>
                  <td>
                    <div className="row-name-cell">
                      <div className={`avatar ${row.name === 'Unknown' ? 'att-unknown-avatar' : ''}`}>
                        {row.initials}
                      </div>
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td>{row.class}</td>
                  <td className="text-muted">{row.roll}</td>
                  <td>
                    <span className={`confidence-score ${parseFloat(row.confidence) < 70 ? 'low' : ''}`}>
                      {row.confidence}
                    </span>
                  </td>
                  <td><Badge label={row.status} /></td>
                  <td className="text-muted text-sm">{row.loggedBy}</td>
                  <td>
                    <span className="link" onClick={() => setSelectedRow(row)}>View</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                ['Timestamp', selectedRow.time],
                ['Student Name', selectedRow.name],
                ['Class', selectedRow.class],
                ['Roll No.', selectedRow.roll],
                ['Match Confidence', selectedRow.confidence],
                ['Status', selectedRow.status],
                ['Logged By', selectedRow.loggedBy],
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
