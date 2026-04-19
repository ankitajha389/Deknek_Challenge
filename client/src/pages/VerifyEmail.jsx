import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

const VerifyEmail = ({ darkMode }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/api/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  const bg = darkMode ? '#111827' : '#f9fafb';
  const text = darkMode ? '#f9fafb' : '#111827';
  const muted = darkMode ? '#9ca3af' : '#6b7280';

  const content = {
    loading: { icon: '⏳', title: 'Verifying...', msg: 'Please wait while we verify your email.' },
    success: { icon: '✅', title: 'Email Verified!', msg: 'Your email has been verified. You can now log in.' },
    error:   { icon: '❌', title: 'Verification Failed', msg: 'This link is invalid or has expired.' },
  }[status];

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{content.icon}</div>
        <h2 style={{ color: text, fontSize: 24, fontWeight: 800 }}>{content.title}</h2>
        <p style={{ color: muted }}>{content.msg}</p>
        {status !== 'loading' && (
          <Link to={status === 'success' ? '/login' : '/forgot-password'} style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            {status === 'success' ? 'Go to Login →' : 'Request new link →'}
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
