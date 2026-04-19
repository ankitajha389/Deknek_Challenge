import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl, formatDate, getRoleBadgeColor } from '../utils/helpers';
import api from '../api/axios';
import Card from '../components/Card';

const StatCard = ({ icon, label, value, color, darkMode }) => (
  <Card darkMode={darkMode} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 52, height: 52, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 13, color: darkMode ? '#9ca3af' : '#6b7280' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: darkMode ? '#f9fafb' : '#111827' }}>{value}</p>
    </div>
  </Card>
);

const Dashboard = ({ darkMode }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    api.get('/api/user/activity?limit=5')
      .then(({ data }) => setLogs(data.logs))
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, []);

  const text = darkMode ? '#f9fafb' : '#111827';
  const muted = darkMode ? '#9ca3af' : '#6b7280';
  const bg = darkMode ? '#111827' : '#f9fafb';

  const actionIcon = (action) => {
    const map = { LOGIN: '🔐', LOGOUT: '🚪', SIGNUP: '🎉', PROFILE_UPDATED: '✏️', PASSWORD_CHANGED: '🔒', AVATAR_UPDATED: '🖼️', EMAIL_VERIFIED: '✅' };
    return map[action] || '📋';
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Welcome Banner */}
        <Card darkMode={darkMode} style={{ marginBottom: 24, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img
              src={getAvatarUrl(user?.avatar_url, user?.name)}
              alt="avatar"
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }}
            />
            <div>
              <h2 style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 800 }}>
                Welcome back, {user?.name}! 👋
              </h2>
              <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                {user?.email} •{' '}
                <span style={{ background: getRoleBadgeColor(user?.role), padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: '#fff' }}>
                  {user?.role}
                </span>
              </p>
              {!user?.is_verified && (
                <p style={{ margin: '8px 0 0', color: '#fde68a', fontSize: 13 }}>
                  ⚠️ Please verify your email address
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <StatCard icon="📅" label="Member since" value={new Date(user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} color="#4f46e5" darkMode={darkMode} />
          <StatCard icon="🕐" label="Last login" value={user?.last_login_at ? formatDate(user.last_login_at).split(',')[0] : 'Now'} color="#16a34a" darkMode={darkMode} />
          <StatCard icon={user?.is_verified ? '✅' : '⚠️'} label="Email status" value={user?.is_verified ? 'Verified' : 'Unverified'} color={user?.is_verified ? '#16a34a' : '#f59e0b'} darkMode={darkMode} />
          <StatCard icon="🛡️" label="Account role" value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} color="#7c3aed" darkMode={darkMode} />
        </div>

        {/* Recent Activity */}
        <Card darkMode={darkMode}>
          <h3 style={{ margin: '0 0 16px', color: text, fontSize: 18, fontWeight: 700 }}>Recent Activity</h3>
          {logsLoading ? (
            <p style={{ color: muted }}>Loading...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: muted }}>No activity yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {logs.map((log) => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${darkMode ? '#374151' : '#f3f4f6'}` }}>
                  <span style={{ fontSize: 22 }}>{actionIcon(log.action)}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 500, color: text, fontSize: 14 }}>{log.action.replace(/_/g, ' ')}</p>
                    <p style={{ margin: 0, color: muted, fontSize: 12 }}>{formatDate(log.created_at)}</p>
                  </div>
                  {log.ip_address && (
                    <span style={{ fontSize: 12, color: muted, background: darkMode ? '#374151' : '#f3f4f6', padding: '2px 8px', borderRadius: 6 }}>
                      {log.ip_address}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
