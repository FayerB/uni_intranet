const { Router } = require('express');
const ctrl = require('./foros.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();
router.use(auth);

router.get('/curso/:cursoId',                   ctrl.getForosByCurso);
router.post('/',          role('admin','docente'), ctrl.createForo);
router.get('/:foroId/hilos',                    ctrl.getHilos);
router.get('/hilos/:hiloId',                    ctrl.getHilo);
router.post('/:foroId/hilos',                   ctrl.createHilo);
router.post('/hilos/:hiloId/responder',          ctrl.responder);
router.patch('/hilos/:hiloId/fijar', role('admin','docente'), ctrl.toggleFijado);

module.exports = router;
