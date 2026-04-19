import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import api from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const Security = ({ darkMode }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pwValues, setPwValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePwChange = (e) => setPwValues((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwValues.newPassword !== pwValues.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await api.patch('/api/user/change-password', {
        currentPassword: pwValues.currentPassword,
        newPassword: pwValues.newPassword,
      });
      toast.success('Password changed! Please log in again.');
      await logout();
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/api/user/account', { data: { password: deletePassword } });
      toast.success('Account deleted');
      await logout();
      navigate('/signup');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const text = darkMode ? '#f9fafb' : '#111827';
  const muted = darkMode ? '#9ca3af' : '#6b7280';
  const bg = darkMode ? '#111827' : '#f9fafb';

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ color: text, marginBottom: 24, fontSize: 24, fontWeight: 800 }}>Security Settings</h2>

        {/* Change Password */}
        <Card darkMode={darkMode} style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 20px', color: text, fontSize: 18, fontWeight: 700 }}>🔒 Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <Input label="Current password" name="currentPassword" type="password" value={pwValues.currentPassword} onChange={handlePwChange} required darkMode={darkMode} />
            <Input label="New password" name="newPassword" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" value={pwValues.newPassword} onChange={handlePwChange} required darkMode={darkMode} />
            <Input label="Confirm new password" name="confirmPassword" type="password" value={pwValues.confirmPassword} onChange={handlePwChange} required darkMode={darkMode} />
            <Button type="submit" loading={pwLoading}>Update Password</Button>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card darkMode={darkMode} style={{ border: '1.5px solid #ef4444' }}>
          <h3 style={{ margin: '0 0 8px', color: '#ef4444', fontSize: 18, fontWeight: 700 }}>⚠️ Danger Zone</h3>
          <p style={{ color: muted, fontSize: 14, marginBottom: 16 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete Account</Button>
          ) : (
            <div>
              <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: 12 }}>Enter your password to confirm deletion:</p>
              <Input type="password" placeholder="Your password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} darkMode={darkMode} />
              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="danger" loading={deleteLoading} onClick={handleDeleteAccount}>Confirm Delete</Button>
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Security;
