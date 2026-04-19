import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../utils/helpers';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const ResetPassword = ({ darkMode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [values, setValues] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setValues((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.password !== values.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password: values.password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const bg = darkMode ? '#111827' : '#f9fafb';
  const cardBg = darkMode ? '#1f2937' : '#fff';
  const text = darkMode ? '#f9fafb' : '#111827';
  const muted = darkMode ? '#9ca3af' : '#6b7280';

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ef4444', fontSize: 18 }}>Invalid reset link.</p>
          <Link to="/forgot-password" style={{ color: '#4f46e5' }}>Request a new one</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <h1 style={{ color: text, margin: 0, fontSize: 28, fontWeight: 800 }}>Set new password</h1>
          <p style={{ color: muted, marginTop: 8 }}>Choose a strong password</p>
        </div>

        <div style={{ background: cardBg, borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
          <form onSubmit={handleSubmit}>
            <Input label="New password" name="password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" value={values.password} onChange={handleChange} required darkMode={darkMode} />
            <Input label="Confirm password" name="confirm" type="password" placeholder="Repeat password" value={values.confirm} onChange={handleChange} required darkMode={darkMode} />
            <Button type="submit" loading={loading} fullWidth>Reset Password</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
