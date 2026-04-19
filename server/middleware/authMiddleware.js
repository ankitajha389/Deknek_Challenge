const { verifyAccessToken } = require('../config/jwt');
const pool = require('../db/pool');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, is_verified FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!rows[0]) return res.status(401).json({ message: 'User not found' });
    if (!rows[0].is_active) return res.status(403).json({ message: 'Account is deactivated' });
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

module.exports = { protect, requireRole };
