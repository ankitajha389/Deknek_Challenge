import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatDate } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';

const actionIcon = (action) => {
  const map = { LOGIN: '🔐', LOGOUT: '🚪', SIGNUP: '🎉', PROFILE_UPDATED: '✏️', PASSWORD_CHANGED: '🔒', AVATAR_UPDATED: '🖼️', EMAIL_VERIFIED: '✅', FORGOT_PASSWORD: '🔑', PASSWORD_RESET: '🔄' };
  return map[action] || '📋';
};

const ActivityLog = ({ darkMode }) => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/user/activity?page=${page}&limit=15`);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const text = darkMode ? '#f9fafb' : '#111827';
  const muted = darkMode ? '#9ca3af' : '#6b7280';
  const bg = darkMode ? '#111827' : '#f9fafb';

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ color: text, marginBottom: 24, fontSize: 24, fontWeight: 800 }}>📋 Activity Log</h2>
        <p style={{ color: muted, marginBottom: 20 }}>{pagination.total} total events</p>

        <Card darkMode={darkMode}>
          {loading ? (
            <p style={{ color: muted }}>Loading...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: muted }}>No activity yet.</p>
          ) : (
            logs.map((log, i) => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0',
                borderBottom: i < logs.length - 1 ? `1px solid ${darkMode ? '#374151' : '#f3f4f6'}` : 'none',
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{actionIcon(log.action)}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: text }}>{log.action.replace(/_/g, ' ')}</p>
                  <p style={{ margin: '2px 0 0', color: muted, fontSize: 13 }}>{formatDate(log.created_at)}</p>
                  {log.ip_address && (
                    <p style={{ margin: '2px 0 0', color: muted, fontSize: 12 }}>IP: {log.ip_address}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </Card>

        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <Button variant="ghost" disabled={pagination.page <= 1} onClick={() => fetchLogs(pagination.page - 1)}>← Prev</Button>
            <span style={{ color: muted, padding: '10px 16px' }}>Page {pagination.page} of {pagination.pages}</span>
            <Button variant="ghost" disabled={pagination.page >= pagination.pages} onClick={() => fetchLogs(pagination.page + 1)}>Next →</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
