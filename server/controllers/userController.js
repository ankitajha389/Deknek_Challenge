const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');
const logActivity = require('../utils/activityLogger');

// ─── Get Profile ──────────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, avatar_url, bio, is_verified, last_login_at, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET
         name = COALESCE($1, name),
         bio  = COALESCE($2, bio)
       WHERE id = $3
       RETURNING id, name, email, role, avatar_url, bio, is_verified, created_at`,
      [name || null, bio !== undefined ? bio : null, req.user.id]
    );
    await logActivity(req.user.id, 'PROFILE_UPDATED', { name, bio }, req);
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Upload Avatar ────────────────────────────────────────────────────────────
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Delete old avatar file if it exists locally
    const { rows: current } = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [req.user.id]);
    if (current[0]?.avatar_url && current[0].avatar_url.startsWith('/uploads/')) {
      const oldPath = path.join(process.cwd(), current[0].avatar_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const { rows } = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, avatar_url',
      [avatarUrl, req.user.id]
    );
    await logActivity(req.user.id, 'AVATAR_UPDATED', {}, req);
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, req.user.id]);

    // Invalidate all refresh tokens
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);

    await logActivity(req.user.id, 'PASSWORD_CHANGED', {}, req);
    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

// ─── Get Activity Logs ────────────────────────────────────────────────────────
const getActivityLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT id, action, details, ip_address, created_at
       FROM activity_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countRes = await pool.query(
      'SELECT COUNT(*) FROM activity_logs WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      logs: rows,
      pagination: {
        page,
        limit,
        total: parseInt(countRes.rows[0].count),
        pages: Math.ceil(countRes.rows[0].count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Account ───────────────────────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required to delete account' });

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(400).json({ message: 'Incorrect password' });

    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, changePassword, getActivityLogs, deleteAccount };
