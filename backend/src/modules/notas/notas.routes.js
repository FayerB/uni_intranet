const { Router } = require('express');
const ctrl = require('./notas.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();
router.use(auth);

router.get('/historial',                          ctrl.getHistorial);
router.get('/historial/:estudianteId', role('admin','docente','padre'), ctrl.getHistorial);
router.get('/',  ctrl.getByCourse);
router.post('/', role('admin', 'docente'), ctrl.upsertMany);

module.exports = router;
