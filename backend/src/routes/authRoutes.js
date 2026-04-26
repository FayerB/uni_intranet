const express = require('express');
const router = express.Router();
const { login, getPerfil, register } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/perfil', authMiddleware, getPerfil);

module.exports = router;