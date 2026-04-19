const router = require('express').Router();
const {
  getProfile, updateProfile, uploadAvatar, changePassword, getActivityLogs, deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { validate, updateProfileRules, changePasswordRules } = require('../validators/authValidators');

router.use(protect);

router.get('/profile',          getProfile);
router.patch('/profile',        updateProfileRules, validate, updateProfile);
router.post('/avatar',          upload.single('avatar'), uploadAvatar);
router.patch('/change-password', changePasswordRules, validate, changePassword);
router.get('/activity',         getActivityLogs);
router.delete('/account',       deleteAccount);

module.exports = router;
