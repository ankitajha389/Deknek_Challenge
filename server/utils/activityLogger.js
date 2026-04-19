const pool = require('../db/pool');

const logActivity = async (userId, action, details = {}, req = null) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
    const userAgent = req ? req.headers['user-agent'] : null;
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, action, JSON.stringify(details), ip, userAgent]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = logActivity;
