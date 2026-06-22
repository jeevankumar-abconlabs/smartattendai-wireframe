import './Header.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/students': 'Student Management',
  '/students/enroll': 'Enroll New Student',
  '/attendance': 'Attendance Log',
  '/reports': 'Reports & Export',
  '/health': 'System Health Monitor',
  '/settings': 'Settings',
};

export default function Header({ pathname }) {
  const title = pageTitles[pathname] ?? 'SmartAttend AI';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__meta">
        <span className="topbar__date text-muted">{today}</span>
        <span className="topbar__divider" />
        <span className="topbar__school">Springfield High School</span>
      </div>
    </header>
  );
}
