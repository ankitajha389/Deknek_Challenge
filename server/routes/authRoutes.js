const router = require('express').Router();
const {
  signup, login, refreshToken, logout, getMe, verifyEmail, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validate, signupRules, loginRules, forgotPasswordRules, resetPasswordRules,
} = require('../validators/authValidators');

router.post('/signup',          authLimiter, signupRules,         validate, signup);
router.post('/login',           authLimiter, loginRules,          validate, login);
router.post('/refresh',         refreshToken);
router.post('/logout',          protect, logout);
router.get('/me',               protect, getMe);
router.get('/verify-email',     verifyEmail);
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password',  authLimiter, resetPasswordRules,  validate, resetPassword);

module.exports = router;
