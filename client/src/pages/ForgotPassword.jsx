import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getErrorMessage } from '../utils/helpers';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const ForgotPassword = ({ darkMode }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent if email exists');
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

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
          <h1 style={{ color: text, margin: 0, fontSize: 28, fontWeight: 800 }}>Forgot password?</h1>
          <p style={{ color: muted, marginTop: 8 }}>We'll send you a reset link</p>
        </div>

        <div style={{ background: cardBg, borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <p style={{ color: text, fontWeight: 600 }}>Check your inbox</p>
              <p style={{ color: muted, fontSize: 14 }}>If an account exists for {email}, you'll receive a reset link shortly.</p>
              <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required darkMode={darkMode} />
              <Button type="submit" loading={loading} fullWidth>Send Reset Link</Button>
              <p style={{ textAlign: 'center', marginTop: 16, color: muted, fontSize: 14 }}>
                <Link to="/login" style={{ color: '#4f46e5', textDecoration: 'none' }}>← Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
