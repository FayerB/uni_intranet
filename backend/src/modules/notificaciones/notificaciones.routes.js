const { Router } = require('express');
const ctrl = require('./notificaciones.controller');
const auth = require('../../middlewares/auth.middleware');

const router = Router();
router.use(auth);

router.get('/',               ctrl.getMias);
router.get('/count',          ctrl.countNoLeidas);
router.patch('/leer-todas',   ctrl.marcarTodas);
router.patch('/:id/leer',     ctrl.marcarLeida);
router.delete('/:id',         ctrl.eliminar);

module.exports = router;
