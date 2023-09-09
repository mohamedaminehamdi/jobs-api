const express = require('express');
const router = express.Router();

const { authLimiter } = require('../middleware/rate-limit');
const { login, register } = require('../controllers/auth');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;
