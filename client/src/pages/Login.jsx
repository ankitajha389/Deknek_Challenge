import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const Login = ({ darkMode }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [values, setValues] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setValues((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
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
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
          <h1 style={{ color: text, margin: 0, fontSize: 28, fontWeight: 800 }}>Welcome back</h1>
          <p style={{ color: muted, marginTop: 8 }}>Sign in to your account</p>
        </div>

        <div style={{ background: cardBg, borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
          <form onSubmit={handleSubmit}>
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={handleChange}
              required
              autoComplete="email"
              darkMode={darkMode}
            />
            <div style={{ position: 'relative' }}>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                darkMode={darkMode}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute', right: 12, top: 34, background: 'none',
                  border: 'none', cursor: 'pointer', color: muted, fontSize: 18,
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -8 }}>
              <Link to="/forgot-password" style={{ color: '#4f46e5', fontSize: 14, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} fullWidth>
              Sign In
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: muted, fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
