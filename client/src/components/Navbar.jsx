import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/helpers';
import toast from 'react-hot-toast';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        textDecoration: 'none',
        color: location.pathname === to ? '#4f46e5' : (darkMode ? '#d1d5db' : '#374151'),
        fontWeight: location.pathname === to ? 600 : 400,
        background: location.pathname === to ? (darkMode ? '#1e1b4b' : '#eef2ff') : 'transparent',
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: darkMode ? '#111827' : '#fff',
      borderBottom: `1px solid ${darkMode ? '#1f2937' : '#e5e7eb'}`,
      padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#4f46e5' }}>⚡ AuthApp</span>
      </Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/profile', 'Profile')}
          {user.role === 'admin' && navLink('/admin', 'Admin')}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleDarkMode}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
          title="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <img
                src={getAvatarUrl(user.avatar_url, user.name)}
                alt="avatar"
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #4f46e5' }}
              />
              <span style={{ color: darkMode ? '#f9fafb' : '#111827', fontWeight: 500 }}>{user.name}</span>
              <span style={{ color: '#9ca3af' }}>▾</span>
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 48, minWidth: 180,
                background: darkMode ? '#1f2937' : '#fff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                overflow: 'hidden', zIndex: 200,
              }}>
                {[
                  { to: '/profile', label: '👤 Profile' },
                  { to: '/profile/activity', label: '📋 Activity' },
                  { to: '/profile/security', label: '🔒 Security' },
                ].map(({ to, label }) => (
                  <Link
                    key={to} to={to}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block', padding: '10px 16px', textDecoration: 'none',
                      color: darkMode ? '#d1d5db' : '#374151',
                    }}
                  >
                    {label}
                  </Link>
                ))}
                <hr style={{ margin: '4px 0', border: 'none', borderTop: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }} />
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#ef4444', fontWeight: 500,
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" style={{ padding: '8px 16px', borderRadius: 6, textDecoration: 'none', color: '#4f46e5', fontWeight: 600 }}>
              Login
            </Link>
            <Link to="/signup" style={{ padding: '8px 16px', borderRadius: 6, textDecoration: 'none', background: '#4f46e5', color: '#fff', fontWeight: 600 }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
