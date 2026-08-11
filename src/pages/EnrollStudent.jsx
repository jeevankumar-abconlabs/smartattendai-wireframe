import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, RotateCcw } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import WebcamCapture from '../components/WebcamCapture';
import { captureFrame } from '../lib/camera';
import { supabase } from '../lib/supabase';
import { detectAllFaces, loadModels } from '../lib/faceRecognition';
import './EnrollStudent.css';

const STEPS = ['Student Info', 'Capture Face', 'Confirm'];

const emptyForm = {
  fullName: '', roll: '', class: '', section: '',
};

export default function EnrollStudent() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [modelsReady, setModelsReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState('');
  const [snapshot, setSnapshot] = useState(null); // { canvas, previewUrl, descriptor }
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadModels().then(() => setModelsReady(true));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCapture() {
    if (!videoRef.current || !modelsReady) return;
    setCapturing(true);
    setCaptureError('');
    try {
      const canvas = captureFrame(videoRef.current);
      const detections = await detectAllFaces(canvas);
      if (detections.length === 0) {
        setCaptureError('No face detected. Make sure your face is clearly visible and try again.');
        return;
      }
      if (detections.length > 1) {
        setCaptureError('Multiple faces detected. Only one person should be in frame.');
        return;
      }
      setSnapshot({
        canvas,
        previewUrl: canvas.toDataURL('image/jpeg', 0.9),
        descriptor: detections[0].descriptor,
      });
    } finally {
      setCapturing(false);
    }
  }

  function retake() {
    setSnapshot(null);
    setCaptureError('');
  }

  async function handleEnroll() {
    if (!snapshot) return;
    setSaving(true);
    setSaveError('');
    try {
      const fileName = `${crypto.randomUUID()}.jpg`;
      const blob = await new Promise((resolve) => snapshot.canvas.toBlob(resolve, 'image/jpeg', 0.9));

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('student-photos').getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('students').insert({
        name: form.fullName,
        roll: form.roll,
        class: form.class,
        section: form.section,
        photo_url: publicUrl,
        face_descriptor: Array.from(snapshot.descriptor),
      });
      if (insertError) throw insertError;

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
              Look directly at the camera with good lighting. This photo generates the student's face profile.
            </p>

            {!snapshot ? (
              <>
                <div className="webcam-frame">
                  <WebcamCapture ref={videoRef} />
                </div>
                {captureError && <p className="enroll-capture-error">{captureError}</p>}
                <div className="enroll-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
                  <button className="btn-primary" onClick={handleCapture} disabled={!modelsReady || capturing}>
                    <Camera size={15} strokeWidth={2.5} />
                    {!modelsReady ? 'Loading face detection…' : capturing ? 'Capturing…' : 'Capture Photo'}
                  </button>
                </div>
              </>
            ) : (
              <div className="upload-preview">
                <img className="upload-preview__img" src={snapshot.previewUrl} alt="Captured face" />
                <p className="font-medium text-sm" style={{ marginTop: 10 }}>
                  {form.fullName || 'Student Photo'}
                </p>
                <button className="link text-xs" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }} onClick={retake}>
                  <RotateCcw size={12} /> Retake photo
                </button>
              </div>
            )}

            <div className="enroll-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" disabled={!snapshot} onClick={() => setStep(3)}>Next →</button>
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
