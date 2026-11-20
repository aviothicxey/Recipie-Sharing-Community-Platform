const express = require('express');
const { register, login, adminLogin, getSession } = require('../controllers/auth.controller');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/session', requireAuth, getSession);

module.exports = router;
