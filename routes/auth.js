const express = require('express');
const router = express.Router();

const { authLimiter } = require('../middleware/rate-limit');
const validate = require('../middleware/validate');
const schemas = require('../validators/auth');
const { login, register } = require('../controllers/auth');

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);

module.exports = router;
