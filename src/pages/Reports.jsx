import { useState } from 'react';
import { Download } from 'lucide-react';
import { reportRows, recentExports } from '../data/mockData';
import './Reports.css';

export default function Reports() {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 700);
  }

  return (
    <div className="page-wrapper">
      <div className="page-top-bar">
        <h1>Reports & Export</h1>
      </div>

      {/* Generator card */}
      <div className="card">
        <h2 className="section-title">Generate Report</h2>
        <div className="reports-form">
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <select className="form-select" style={{ maxWidth: 260 }}>
              <option>Daily Summary</option>
              <option>Weekly Summary</option>
              <option>Monthly Summary</option>
              <option>Student-wise Report</option>
              <option>Class-wise Report</option>
            </select>
          </div>
          <div className="reports-dates">
            <div className="form-group">
              <label className="form-label">From</label>
              <input type="date" className="form-input" defaultValue="2026-06-01" />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input type="date" className="form-input" defaultValue="2026-06-22" />
            </div>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select className="form-select">
                <option value="">All Classes</option>
                {['8', '9', '10', '11', '12'].map((c) => (
                  <option key={c}>Class {c}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate Report'}
          </button>
        </div>

        {generated && (
          <div className="report-preview">
            <div className="report-preview__header">
              <h3 className="font-semibold" style={{ fontSize: 15 }}>
                Attendance Report — June 2026
              </h3>
              <button className="btn-secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
                <Download size={14} strokeWidth={2} />
                Export as Excel
              </button>
            </div>
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No.</th>
                    <th>Class</th>
                    <th>Days Present</th>
                    <th>Days Absent</th>
                    <th>% Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row) => (
                    <tr key={row.roll}>
                      <td className="font-medium">{row.name}</td>
                      <td className="text-muted">{row.roll}</td>
                      <td>{row.class}</td>
                      <td>{row.present}</td>
                      <td className="text-muted">{row.absent}</td>
                      <td>
                        <span style={{ color: '#2563EB', fontWeight: 500 }}>{row.pct}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Export history */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="section-title">Recent Exports</h2>
        <div className="export-list">
          {recentExports.map((e) => (
            <div className="export-item" key={e.name}>
              <div className="export-item__file">
                <div className="export-item__icon">XLS</div>
                <div>
                  <p className="font-medium" style={{ fontSize: 14 }}>{e.name}</p>
                  <p className="text-muted text-xs">Exported {e.exported}</p>
                </div>
              </div>
              <a href="#" className="link" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Download size={13} strokeWidth={2} />
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
