import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#16a34a'];

const Signup = ({ darkMode }) => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setValues((p) => ({ ...p, [e.target.name]: e.target.value }));
  const strength = getPasswordStrength(values.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(values.name, values.email, values.password);
      toast.success('Account created! Check your email to verify.');
      navigate('/dashboard');
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
          <div style={{ fontSize: 48, marginBottom: 8 }}>🚀</div>
          <h1 style={{ color: text, margin: 0, fontSize: 28, fontWeight: 800 }}>Create account</h1>
          <p style={{ color: muted, marginTop: 8 }}>Join us today, it's free</p>
        </div>

        <div style={{ background: cardBg, borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
          <form onSubmit={handleSubmit}>
            <Input label="Full name" name="name" type="text" placeholder="John Doe" value={values.name} onChange={handleChange} required darkMode={darkMode} />
            <Input label="Email address" name="email" type="email" placeholder="you@example.com" value={values.email} onChange={handleChange} required darkMode={darkMode} />

            <div style={{ position: 'relative' }}>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={values.password}
                onChange={handleChange}
                required
                darkMode={darkMode}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 18 }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {values.password && (
              <div style={{ marginBottom: 16, marginTop: -8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? strengthColor[strength] : (darkMode ? '#374151' : '#e5e7eb'), transition: 'background 0.2s' }} />
                  ))}
                </div>
                <p style={{ fontSize: 12, color: strengthColor[strength], margin: 0 }}>
                  {strengthLabel[strength]}
                </p>
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth>
              Create Account
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: muted, fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
