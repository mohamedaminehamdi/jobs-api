const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authentication');
const { authLimiter } = require('../middleware/rate-limit');
const validate = require('../middleware/validate');
const schemas = require('../validators/auth');
const {
  login,
  register,
  getCurrentUser,
  updateUser,
  updatePassword,
} = require('../controllers/auth');

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);
router.get('/me', authenticate, getCurrentUser);
router.patch('/updateUser', authenticate, validate(schemas.updateUser), updateUser);
router.patch('/updatePassword', authenticate, validate(schemas.updatePassword), updatePassword);

module.exports = router;
