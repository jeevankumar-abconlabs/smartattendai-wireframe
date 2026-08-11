import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Students.css';

function initialsOf(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// photo_url looks like https://<project>.supabase.co/storage/v1/object/public/student-photos/<file>
function storagePathFromUrl(photoUrl) {
  const marker = '/student-photos/';
  const i = photoUrl?.indexOf(marker);
  return i >= 0 ? photoUrl.slice(i + marker.length) : null;
}

export default function Students() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    supabase
      .from('students')
      .select('id, name, roll, class, section, photo_url, enrolled_at')
      .order('enrolled_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setStudents(data || []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(student) {
    if (!window.confirm(`Delete ${student.name}? This removes their face profile and attendance history. This can't be undone.`)) {
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      const path = storagePathFromUrl(student.photo_url);
      if (path) await supabase.storage.from('student-photos').remove([path]);

      const { error } = await supabase.from('students').delete().eq('id', student.id);
      if (error) throw error;

      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setSelectedStudent(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete student. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  const filtered = students.filter((s) => {
    const matchQuery =
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.roll || '').includes(query);
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

        {loading ? (
          <div className="students-empty">
            <p className="text-muted text-sm">Loading students…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="students-empty">
            <div className="students-empty__icon">🔍</div>
            <p className="font-medium">No students found.</p>
            <p className="text-muted text-sm">
              {students.length === 0 ? 'Enroll your first student to get started.' : 'Try adjusting your search.'}
            </p>
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
                  <th>Enrolled On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-muted text-sm">{i + 1}</td>
                    <td>
                      <div className="row-name-cell">
                        <div className="avatar">{initialsOf(s.name)}</div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{s.roll || '—'}</td>
                    <td>{s.class ? `Class ${s.class}` : '—'}</td>
                    <td>{s.section || '—'}</td>
                    <td className="text-muted text-sm">{formatDate(s.enrolled_at)}</td>
                    <td>
                      <span className="link" onClick={() => { setSelectedStudent(s); setDeleteError(''); }}>View</span>
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
              <button className="btn-secondary pagination-btn" disabled>Next →</button>
            </div>
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="att-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="att-modal card" onClick={(e) => e.stopPropagation()}>
            <div className="att-modal__header">
              <h3 className="font-semibold" style={{ fontSize: 16 }}>Student Profile</h3>
              <button className="att-modal__close" onClick={() => setSelectedStudent(null)}>✕</button>
            </div>
            <div className="divider" style={{ margin: '12px 0' }} />

            <div className="student-modal-photo-wrap">
              {selectedStudent.photo_url ? (
                <img className="student-modal-photo" src={selectedStudent.photo_url} alt={selectedStudent.name} />
              ) : (
                <div className="avatar student-modal-photo-fallback">{initialsOf(selectedStudent.name)}</div>
              )}
            </div>

            <div className="confirm-summary">
              {[
                ['Full Name', selectedStudent.name],
                ['Roll Number', selectedStudent.roll || '—'],
                ['Class', selectedStudent.class ? `Class ${selectedStudent.class}` : '—'],
                ['Section', selectedStudent.section || '—'],
                ['Enrolled On', formatDate(selectedStudent.enrolled_at)],
              ].map(([label, val]) => (
                <div className="confirm-row" key={label}>
                  <span className="confirm-row__label text-muted text-sm">{label}</span>
                  <span className="confirm-row__value font-medium">{val}</span>
                </div>
              ))}
            </div>

            {deleteError && <p className="enroll-capture-error">{deleteError}</p>}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
              <button className="link student-modal-delete" disabled={deleting} onClick={() => handleDelete(selectedStudent)}>
                {deleting ? 'Deleting…' : 'Delete Student'}
              </button>
              <button className="btn-secondary" onClick={() => setSelectedStudent(null)} disabled={deleting}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
