import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronLeft } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import './EnrollStudent.css';

const STEPS = ['Student Info', 'Upload Photo', 'Confirm'];

const emptyForm = {
  fullName: '', roll: '', class: '', section: '', rfid: '',
};

export default function EnrollStudent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [uploaded, setUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleEnroll() {
    setSaving(true);
    setTimeout(() => {
      setToast(`${form.fullName || 'Student'} enrolled successfully.`);
      setTimeout(() => navigate('/students'), 1800);
    }, 800);
  }

  return (
    <div className="page-wrapper">
      <div className="enroll-back">
        <button className="btn-secondary" onClick={() => navigate('/students')}>
          <ChevronLeft size={15} strokeWidth={2.5} />
          Back to Students
        </button>
      </div>

      <div className="enroll-card card">
        <StepIndicator steps={STEPS} current={step} />

        {step === 1 && (
          <div className="enroll-step">
            <h2 className="enroll-step__title">Student Information</h2>
            <div className="enroll-fields">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="e.g. Arjun Kumar"
                  value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input className="form-input" placeholder="e.g. 1042"
                  value={form.roll} onChange={(e) => update('roll', e.target.value)} />
              </div>
              <div className="enroll-row">
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select className="form-select"
                    value={form.class} onChange={(e) => update('class', e.target.value)}>
                    <option value="">Select class</option>
                    {['8', '9', '10', '11', '12'].map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select className="form-select"
                    value={form.section} onChange={(e) => update('section', e.target.value)}>
                    <option value="">Select section</option>
                    {['A', 'B', 'C'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">RFID Tag ID</label>
                <input className="form-input" placeholder="Scan or enter tag ID"
                  value={form.rfid} onChange={(e) => update('rfid', e.target.value)} />
              </div>
            </div>
            <div className="enroll-actions">
              <button className="btn-primary" onClick={() => setStep(2)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="enroll-step">
            <h2 className="enroll-step__title">Upload Student Photo</h2>
            <p className="enroll-step__desc text-muted text-sm">
              Upload a clear, front-facing photo of the student. This will be used to generate their face profile.
            </p>

            {!uploaded ? (
              <div className="upload-box" onClick={() => setUploaded(true)}>
                <Upload size={28} className="upload-box__icon" />
                <p className="font-medium" style={{ fontSize: 14 }}>Click to upload or drag and drop</p>
                <p className="text-muted text-xs">JPG or PNG, max 5MB</p>
              </div>
            ) : (
              <div className="upload-preview">
                <div className="upload-preview__img" />
                <p className="font-medium text-sm" style={{ marginTop: 10 }}>
                  {form.fullName || 'Student Photo'}
                </p>
                <button className="link text-xs" style={{ marginTop: 4 }} onClick={() => setUploaded(false)}>
                  Remove photo
                </button>
              </div>
            )}

            <div className="enroll-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="enroll-step">
            <h2 className="enroll-step__title">Confirm Enrollment</h2>
            <div className="confirm-summary">
              {[
                ['Full Name', form.fullName || '—'],
                ['Roll Number', form.roll || '—'],
                ['Class', form.class ? `Class ${form.class}` : '—'],
                ['Section', form.section || '—'],
                ['RFID Tag', form.rfid || '—'],
              ].map(([label, val]) => (
                <div className="confirm-row" key={label}>
                  <span className="confirm-row__label text-muted text-sm">{label}</span>
                  <span className="confirm-row__value font-medium">{val}</span>
                </div>
              ))}
            </div>

            <div className="enroll-actions" style={{ flexDirection: 'column', gap: 10 }}>
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleEnroll}
                disabled={saving}
              >
                {saving ? 'Enrolling…' : 'Enroll Student'}
              </button>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setStep(2)}>
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="enroll-toast">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
