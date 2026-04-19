import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatDate, getErrorMessage, getRoleBadgeColor } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

const AdminPanel = ({ darkMode }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);

  const fetchData = async (page = 1, q = search) => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get(`/api/admin/users?page=${page}&limit=10${q ? `&search=${encodeURIComponent(q)}` : ''}`),
      ]);
      setStats(statsRes.data.stats);
      setRecentLogs(statsRes.data.recentActivity);
      setUsers(usersRes.data.users);
      setPagination(usersRes.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(1, search);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      fetchData(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${userId}/toggle`);
      toast.success(`User ${data.user.is_active ? 'activated' : 'deactivated'}`);
      fetchData(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted');
      fetchData(pagination.page);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const text = darkMode ? '#f9fafb' : '#111827';
  const muted = darkMode ? '#9ca3af' : '#6b7280';
  const bg = darkMode ? '#111827' : '#f9fafb';
  const tableBorder = darkMode ? '#374151' : '#e5e7eb';

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ color: text, marginBottom: 24, fontSize: 24, fontWeight: 800 }}>🛡️ Admin Panel</h2>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#4f46e5' },
              { icon: '✅', label: 'Active Users', value: stats.activeUsers, color: '#16a34a' },
              { icon: '📧', label: 'Verified', value: stats.verifiedUsers, color: '#0891b2' },
            ].map(({ icon, label, value, color }) => (
              <Card key={label} darkMode={darkMode} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: muted }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: text }}>{value}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Search */}
        <Card darkMode={darkMode} style={{ marginBottom: 20 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input label="Search users" placeholder="Name or email..." value={search} onChange={(e) => setSearch(e.target.value)} darkMode={darkMode} style={{ marginBottom: 0 }} />
            </div>
            <Button type="submit" style={{ marginBottom: 16 }}>Search</Button>
            {search && <Button type="button" variant="ghost" onClick={() => { setSearch(''); fetchData(1, ''); }} style={{ marginBottom: 16 }}>Clear</Button>}
          </form>
        </Card>

        {/* Users Table */}
        <Card darkMode={darkMode} style={{ marginBottom: 24, overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 16px', color: text, fontSize: 18, fontWeight: 700 }}>
            Users ({pagination.total})
          </h3>
          {loading ? (
            <p style={{ color: muted }}>Loading...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${tableBorder}` }}>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: muted, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${tableBorder}` }}>
                    <td style={{ padding: '10px 12px', color: text, fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '10px 12px', color: muted }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{
                          background: getRoleBadgeColor(u.role), color: '#fff',
                          border: 'none', borderRadius: 6, padding: '3px 8px',
                          fontWeight: 600, cursor: 'pointer', fontSize: 13,
                        }}
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: u.is_active ? '#dcfce7' : '#fee2e2',
                        color: u.is_active ? '#16a34a' : '#dc2626',
                      }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: muted }}>{formatDate(u.created_at).split(',')[0]}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: u.is_active ? '#fef3c7' : '#dcfce7', color: u.is_active ? '#92400e' : '#166534' }}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: '#fee2e2', color: '#dc2626' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <Button variant="ghost" disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)}>← Prev</Button>
              <span style={{ color: muted, padding: '10px 16px' }}>Page {pagination.page} of {pagination.pages}</span>
              <Button variant="ghost" disabled={pagination.page >= pagination.pages} onClick={() => fetchData(pagination.page + 1)}>Next →</Button>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card darkMode={darkMode}>
          <h3 style={{ margin: '0 0 16px', color: text, fontSize: 18, fontWeight: 700 }}>Recent System Activity</h3>
          {recentLogs.map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${tableBorder}` }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: text, fontSize: 14 }}>
                  <strong>{log.name || 'Unknown'}</strong> ({log.email}) — {log.action.replace(/_/g, ' ')}
                </p>
                <p style={{ margin: 0, color: muted, fontSize: 12 }}>{formatDate(log.created_at)}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
