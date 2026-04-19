const router = require('express').Router();
const {
  listUsers, getUser, updateUserRole, toggleUserActive, deleteUser, getDashboardStats, getAllLogs,
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.use(protect, requireRole('admin'));

router.get('/stats',              getDashboardStats);
router.get('/users',              listUsers);
router.get('/users/:id',          getUser);
router.patch('/users/:id/role',   updateUserRole);
router.patch('/users/:id/toggle', toggleUserActive);
router.delete('/users/:id',       deleteUser);
router.get('/logs',               getAllLogs);

module.exports = router;
