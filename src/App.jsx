import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import EnrollStudent from './pages/EnrollStudent';
import AttendanceLog from './pages/AttendanceLog';
import Reports from './pages/Reports';
import SystemHealth from './pages/SystemHealth';
import Settings from './pages/Settings';

function AppShell() {
  const location = useLocation();
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <Header pathname={location.pathname} />
        <main className="app-main">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/enroll" element={<EnrollStudent />} />
            <Route path="/attendance" element={<AttendanceLog />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/health" element={<SystemHealth />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
