import { useState } from 'react';
import './Settings.css';

function SettingsSection({ title, children, onSave, saveLabel = 'Save Changes' }) {
  const [saved, setSaved] = useState(false);
  function handle() {
    setSaved(true);
    if (onSave) onSave();
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <div className="card settings-section">
      <h2 className="settings-section__title">{title}</h2>
      <div className="divider" style={{ margin: '12px 0 20px' }} />
      <div className="settings-fields">{children}</div>
      <div className="settings-section__footer">
        <button className="btn-primary" onClick={handle} disabled={saved}>
          {saved ? '✓ Saved' : saveLabel}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [threshold, setThreshold] = useState(80);

  return (
    <div className="page-wrapper">
      <div className="page-top-bar">
        <h1>Settings</h1>
      </div>

      {/* School info */}
      <SettingsSection title="School Information">
        <div className="form-group">
          <label className="form-label">School Name</label>
          <input className="form-input" defaultValue="Springfield High School" />
        </div>
        <div className="form-group">
          <label className="form-label">School Code</label>
          <input className="form-input" defaultValue="SFH-2024" />
        </div>
        <div className="form-group">
          <label className="form-label">Academic Year</label>
          <select className="form-select">
            <option>2025–2026</option>
            <option>2026–2027</option>
          </select>
        </div>
      </SettingsSection>

      {/* Recognition settings */}
      <SettingsSection title="Recognition Settings">
        <div className="form-group">
          <label className="form-label">
            Confidence Threshold
            <span className="settings-threshold-val">{threshold}%</span>
          </label>
          <p className="text-muted text-xs" style={{ marginBottom: 10 }}>
            Minimum confidence required to mark attendance
          </p>
          <input
            type="range"
            min="50"
            max="99"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="settings-slider"
          />
          <div className="settings-slider-labels">
            <span className="text-xs text-muted">50%</span>
            <span className="text-xs text-muted">99%</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Duplicate Scan Window (minutes)</label>
          <input className="form-input" defaultValue="5" style={{ maxWidth: 120 }} type="number" min="1" max="60" />
          <p className="text-muted text-xs" style={{ marginTop: 6 }}>
            Prevent duplicate scans within this window
          </p>
        </div>
      </SettingsSection>

      {/* Camera settings */}
      <SettingsSection title="Camera Settings">
        <div className="form-group">
          <label className="form-label">Camera Source</label>
          <select className="form-select" style={{ maxWidth: 260 }}>
            <option>USB Camera</option>
            <option>IP Camera (RTSP)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">RTSP URL</label>
          <input className="form-input" placeholder="rtsp://192.168.1.x/stream" />
        </div>
      </SettingsSection>

      {/* User account */}
      <div className="card settings-section">
        <h2 className="settings-section__title">User Account</h2>
        <div className="divider" style={{ margin: '12px 0 20px' }} />
        <div className="settings-fields">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" defaultValue="Admin User" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" defaultValue="admin@springfieldhigh.edu" type="email" />
          </div>
        </div>
        <div className="settings-section__footer">
          <button className="btn-primary">Update Profile</button>
          <button className="btn-outline">Change Password</button>
        </div>
      </div>
    </div>
  );
}
