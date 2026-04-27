const { Router } = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = Router();

router.post('/login', authController.login);
router.get('/perfil', authMiddleware, authController.getPerfil);

module.exports = router;
