const { Router } = require('express');
const ctrl = require('./asistencias.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();
router.use(auth);

router.get('/',  ctrl.getForDate);
router.post('/', role('admin', 'docente'), ctrl.upsertMany);

module.exports = router;
