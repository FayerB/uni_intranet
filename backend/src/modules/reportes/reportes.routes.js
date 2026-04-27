const { Router } = require('express');
const reportesController = require('./reportes.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/usuarios', reportesController.getUsuarios);
router.get('/noticias', reportesController.getNoticias);
router.get('/resumen',  reportesController.getResumen);

module.exports = router;
