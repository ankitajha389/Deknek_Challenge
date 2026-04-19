import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl, getErrorMessage } from '../utils/helpers';
import api from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const Profile = ({ darkMode }) => {
  const { user, updateUser } = useAuth();
  const [values, setValues] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => setValues((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/api/user/profile', values);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const { data } = await api.post('/api/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const text = darkMode ? '#f9fafb' : '#111827';
  const muted = darkMode ? '#9ca3af' : '#6b7280';
  const bg = darkMode ? '#111827' : '#f9fafb';

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '32px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ color: text, marginBottom: 24, fontSize: 24, fontWeight: 800 }}>Your Profile</h2>

        {/* Avatar */}
        <Card darkMode={darkMode} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={getAvatarUrl(user?.avatar_url, user?.name)}
              alt="avatar"
              style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #4f46e5' }}
            />
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              background: '#4f46e5', color: '#fff', borderRadius: '50%',
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 14,
            }}>
              {uploading ? '⏳' : '📷'}
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: text, fontSize: 18 }}>{user?.name}</p>
            <p style={{ margin: '2px 0 0', color: muted, fontSize: 14 }}>{user?.email}</p>
            <span style={{ fontSize: 12, background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
              {user?.role}
            </span>
          </div>
        </Card>

        {/* Edit Form */}
        <Card darkMode={darkMode}>
          <h3 style={{ margin: '0 0 20px', color: text, fontSize: 18, fontWeight: 700 }}>Edit Profile</h3>
          <form onSubmit={handleSave}>
            <Input label="Full name" name="name" value={values.name} onChange={handleChange} required darkMode={darkMode} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14, color: darkMode ? '#d1d5db' : '#374151' }}>Bio</label>
              <textarea
                name="bio"
                value={values.bio}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                placeholder="Tell us about yourself..."
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 15,
                  border: `1.5px solid ${darkMode ? '#374151' : '#d1d5db'}`,
                  background: darkMode ? '#1f2937' : '#fff',
                  color: darkMode ? '#f9fafb' : '#111827',
                  resize: 'vertical', boxSizing: 'border-box', outline: 'none',
                }}
              />
              <p style={{ fontSize: 12, color: muted, textAlign: 'right', margin: '2px 0 0' }}>{values.bio.length}/500</p>
            </div>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
