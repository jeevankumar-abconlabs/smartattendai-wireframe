import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import './Login.css';

const FEATURES = [
  'Face recognition with 94%+ accuracy across all gate cameras',
  'Real-time attendance log with confidence scoring per student',
  'Class-wise and student-wise reports exported in one click',
];

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate('/dashboard'), 800);
  }

  return (
    <div className="login-page">
      {/* Left — brand panel */}
      <div className="login-left">
        <div className="login-left__inner">
          <div className="login-brand">
            <div className="login-logo">
              <img src="/icon.png" alt="SmartAttend AI" className="login-logo-img" />
            </div>
            <span className="login-appname">SmartAttend AI</span>
          </div>

          <div className="login-hero-text">
            <h1 className="login-headline">Attendance,<br />handled at the gate.</h1>
            <p className="login-sub">
              A face recognition system built for schools. No registers. No delays.
            </p>
          </div>

          <ul className="login-features">
            {FEATURES.map((f) => (
              <li key={f} className="login-feature">
                <CheckCircle2 size={15} strokeWidth={2} className="login-feature__icon" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <p className="login-school-name">Springfield High School</p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2 className="login-form-title">Sign in</h2>
            <p className="login-form-sub text-muted">Welcome back. Enter your credentials below.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@springfieldhigh.edu"
                defaultValue="admin@springfieldhigh.edu"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                defaultValue="password"
                required
              />
            </div>

            <div className="login-remember-row">
              <label className="login-remember">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Remember me</span>
              </label>
              <span className="text-muted text-xs">Forgot password? Contact admin.</span>
            </div>

            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
