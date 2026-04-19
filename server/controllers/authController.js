const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../db/pool');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const logActivity = require('../utils/activityLogger');

// ─── Signup ──────────────────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, is_verified, created_at`,
      [name, email, password_hash]
    );
    const user = rows[0];

    // Email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [user.id, verifyToken]
    );

    try {
      await sendVerificationEmail(email, verifyToken);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
    }

    await logActivity(user.id, 'SIGNUP', { email }, req);

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated. Contact support.' });
    }

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    await logActivity(user.id, 'LOGIN', { email }, req);

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token required' });

    const decoded = verifyRefreshToken(token);

    const { rows } = await pool.query(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );
    if (!rows[0]) return res.status(401).json({ message: 'Invalid or expired refresh token' });

    // Rotate refresh token
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);

    const userRes = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newAccessToken = signAccessToken({ id: user.id, role: user.role });
    const newRefreshToken = signRefreshToken({ id: user.id });

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, newRefreshToken]
    );

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    }
    await logActivity(req.user.id, 'LOGOUT', {}, req);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token required' });

    const { rows } = await pool.query(
      `SELECT * FROM email_verification_tokens
       WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );
    if (!rows[0]) return res.status(400).json({ message: 'Invalid or expired verification link' });

    await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [rows[0].user_id]);
    await pool.query('DELETE FROM email_verification_tokens WHERE id = $1', [rows[0].id]);
    await logActivity(rows[0].user_id, 'EMAIL_VERIFIED', {}, req);

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    // Always respond 200 to prevent email enumeration
    if (!rows[0]) return res.json({ message: 'If that email exists, a reset link has been sent' });

    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')
       ON CONFLICT DO NOTHING`,
      [rows[0].id, token]
    );

    try {
      await sendPasswordResetEmail(email, token);
    } catch (emailErr) {
      console.error('Reset email failed:', emailErr.message);
    }

    await logActivity(rows[0].id, 'FORGOT_PASSWORD', { email }, req);
    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const { rows } = await pool.query(
      `SELECT * FROM password_reset_tokens
       WHERE token = $1 AND expires_at > NOW() AND used = FALSE`,
      [token]
    );
    if (!rows[0]) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const password_hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, rows[0].user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [rows[0].id]);

    // Invalidate all refresh tokens for security
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [rows[0].user_id]);

    await logActivity(rows[0].user_id, 'PASSWORD_RESET', {}, req);
    res.json({ message: 'Password reset successfully. Please log in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
