const express = require('express');
const router = express.Router();

const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); // POST is better for logout

module.exports = router;