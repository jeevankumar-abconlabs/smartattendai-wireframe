import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, BarChart2,
  Activity, Settings, Camera, LogOut
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/students', label: 'Students', Icon: Users },
  { to: '/attendance', label: 'Attendance Log', Icon: ClipboardList },
  { to: '/reports', label: 'Reports', Icon: BarChart2 },
  { to: '/health', label: 'System Health', Icon: Activity },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Camera size={18} strokeWidth={2} />
        </div>
        <span className="sidebar__name">SmartAttend AI</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
            }
          >
            <Icon size={17} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>AU</div>
          <span className="sidebar__username">Admin User</span>
        </div>
        <button
          className="sidebar__signout"
          onClick={() => navigate('/login')}
        >
          <LogOut size={14} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
