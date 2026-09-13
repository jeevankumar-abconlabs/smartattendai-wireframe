import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, X } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import WebcamCapture from '../components/WebcamCapture';
import { captureFrame } from '../lib/camera';
import { enrollStudent } from '../lib/api';
import './EnrollStudent.css';

const STEPS = ['Student Info', 'Capture Face', 'Confirm'];
const MAX_SHOTS = 5;
const RECOMMENDED_ANGLES = ['Front', 'Left profile', 'Right profile'];

const emptyForm = {
  fullName: '', roll: '', class: '', section: '',
};

export default function EnrollStudent() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [snapshots, setSnapshots] = useState([]); // [{ id, canvas, previewUrl }]
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleCapture() {
    if (!videoRef.current || snapshots.length >= MAX_SHOTS) return;
    const canvas = captureFrame(videoRef.current);
    setSnapshots((prev) => [
      ...prev,
      { id: crypto.randomUUID(), canvas, previewUrl: canvas.toDataURL('image/jpeg', 0.9) },
    ]);
  }

  function removeSnapshot(id) {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleEnroll() {
    if (snapshots.length === 0) return;
    setSaving(true);
    setSaveError('');
    try {
      const blobs = await Promise.all(
        snapshots.map((s) => new Promise((resolve) => s.canvas.toBlob(resolve, 'image/jpeg', 0.9)))
      );
      await enrollStudent(form, blobs);
      setToast(`${form.fullName || 'Student'} enrolled successfully.`);
      setTimeout(() => navigate('/students'), 1400);
    } catch (err) {
      setSaveError(err.message || 'Failed to enroll student. Please try again.');
    } finally {
      setSaving(false);
    }
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
            </div>
            <div className="enroll-actions">
              <button className="btn-primary" disabled={!form.fullName} onClick={() => setStep(2)}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="enroll-step">
            <h2 className="enroll-step__title">Capture Student Face</h2>
            <p className="enroll-step__desc text-muted text-sm">
              Capture a few angles — {RECOMMENDED_ANGLES.join(', ')} — so the student is still recognized
              when a camera only catches their side. At least 1 photo is required, up to {MAX_SHOTS}.
            </p>

            <div className="webcam-frame">
              <WebcamCapture ref={videoRef} />
            </div>
            <div className="enroll-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button className="btn-primary" onClick={handleCapture} disabled={snapshots.length >= MAX_SHOTS}>
                <Camera size={15} strokeWidth={2.5} />
                Capture Photo ({snapshots.length}/{MAX_SHOTS})
              </button>
            </div>

            {snapshots.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16, justifyContent: 'center' }}>
                {snapshots.map((s, i) => (
                  <div key={s.id} style={{ position: 'relative' }}>
                    <img
                      src={s.previewUrl}
                      alt={`Captured angle ${i + 1}`}
                      style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <button
                      className="link text-xs"
                      onClick={() => removeSnapshot(s.id)}
                      style={{
                        position: 'absolute', top: -6, right: -6, background: '#fff',
                        borderRadius: '50%', width: 20, height: 20, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                      }}
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="enroll-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" disabled={snapshots.length === 0} onClick={() => setStep(3)}>Next →</button>
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
                ['Angles Captured', String(snapshots.length)],
              ].map(([label, val]) => (
                <div className="confirm-row" key={label}>
                  <span className="confirm-row__label text-muted text-sm">{label}</span>
                  <span className="confirm-row__value font-medium">{val}</span>
                </div>
              ))}
            </div>

            {saveError && <p className="enroll-capture-error">{saveError}</p>}

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
                onClick={() => setStep(2)} disabled={saving}>
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
