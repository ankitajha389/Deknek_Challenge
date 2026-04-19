const pool = require('../db/pool');
const logActivity = require('../utils/activityLogger');

// ─── List All Users ───────────────────────────────────────────────────────────
const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    const query = search
      ? `SELECT id, name, email, role, is_active, is_verified, last_login_at, created_at
         FROM users WHERE name ILIKE $1 OR email ILIKE $1
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`
      : `SELECT id, name, email, role, is_active, is_verified, last_login_at, created_at
         FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`;

    const params = search ? [search, limit, offset] : [limit, offset];
    const { rows } = await pool.query(query, params);

    const countQuery = search
      ? 'SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1'
      : 'SELECT COUNT(*) FROM users';
    const countParams = search ? [search] : [];
    const countRes = await pool.query(countQuery, countParams);

    res.json({
      users: rows,
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

// ─── Get Single User ──────────────────────────────────────────────────────────
const getUser = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, avatar_url, bio, is_active, is_verified, last_login_at, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Update User Role ─────────────────────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const { rows } = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });

    await logActivity(req.user.id, 'ADMIN_ROLE_CHANGED', { targetUser: req.params.id, newRole: role }, req);
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Toggle User Active Status ────────────────────────────────────────────────
const toggleUserActive = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    const { rows } = await pool.query(
      `UPDATE users SET is_active = NOT is_active
       WHERE id = $1
       RETURNING id, name, email, is_active`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });

    await logActivity(req.user.id, 'ADMIN_TOGGLE_ACTIVE', { targetUser: req.params.id, is_active: rows[0].is_active }, req);
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account via admin panel' });
    }
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'User not found' });

    await logActivity(req.user.id, 'ADMIN_DELETE_USER', { targetUser: req.params.id }, req);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, verifiedUsers, recentLogs] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM users WHERE is_verified = TRUE'),
      pool.query(
        `SELECT al.id, al.action, al.created_at, u.name, u.email
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.id
         ORDER BY al.created_at DESC LIMIT 10`
      ),
    ]);

    res.json({
      stats: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        verifiedUsers: parseInt(verifiedUsers.rows[0].count),
      },
      recentActivity: recentLogs.rows,
    });
  } catch (err) {
    next(err);
  }
};

// ─── All Activity Logs ────────────────────────────────────────────────────────
const getAllLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT al.id, al.action, al.details, al.ip_address, al.created_at,
              u.name, u.email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countRes = await pool.query('SELECT COUNT(*) FROM activity_logs');
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

module.exports = { listUsers, getUser, updateUserRole, toggleUserActive, deleteUser, getDashboardStats, getAllLogs };
