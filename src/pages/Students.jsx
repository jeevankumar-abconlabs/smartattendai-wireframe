import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { students } from '../data/mockData';
import './Students.css';

export default function Students() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filtered = students.filter((s) => {
    const matchQuery =
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.roll.includes(query);
    const matchClass = !classFilter || s.class === classFilter;
    return matchQuery && matchClass;
  });

  return (
    <div className="page-wrapper">
      <div className="page-top-bar">
        <h1>Students</h1>
        <button className="btn-primary" onClick={() => navigate('/students/enroll')}>
          <Plus size={15} strokeWidth={2.5} />
          Enroll New Student
        </button>
      </div>

      <div className="card">
        {/* Filter bar */}
        <div className="students-filters">
          <div className="students-search">
            <Search size={15} className="students-search__icon" />
            <input
              type="text"
              className="form-input students-search__input"
              placeholder="Search by name or roll number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className="form-select students-class-filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {['8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div className="divider" style={{ margin: '16px 0' }} />

        {filtered.length === 0 ? (
          <div className="students-empty">
            <div className="students-empty__icon">🔍</div>
            <p className="font-medium">No students found.</p>
            <p className="text-muted text-sm">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Roll No.</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>RFID Tag</th>
                  <th>Enrolled On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-muted text-sm">{i + 1}</td>
                    <td>
                      <div className="row-name-cell">
                        <div className="avatar">{s.initials}</div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{s.roll}</td>
                    <td>Class {s.class}</td>
                    <td>{s.section}</td>
                    <td className="text-muted text-sm">{s.rfid}</td>
                    <td className="text-muted text-sm">{s.enrolled}</td>
                    <td>
                      <span className="link" style={{ marginRight: 12 }}>View</span>
                      <span className="link">Edit</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="students-pagination">
            <span className="text-muted text-sm">
              Showing {filtered.length} of {students.length} students
            </span>
            <div className="pagination-controls">
              <button className="btn-secondary pagination-btn" disabled>← Prev</button>
              <button className="pagination-page active">1</button>
              <button className="btn-secondary pagination-btn">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
