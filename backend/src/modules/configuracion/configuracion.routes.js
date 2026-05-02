const { Router } = require('express');
const ctrl = require('./configuracion.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();
router.use(auth);

router.get('/',                          ctrl.getAll);
router.put('/',           role('admin'), ctrl.setBulk);
router.patch('/item',     role('admin'), ctrl.set);
router.get('/periodos',                  ctrl.getPeriodos);
router.post('/periodos',  role('admin'), ctrl.createPeriodo);
router.patch('/periodos/:id/activar', role('admin'), ctrl.setPeriodoActivo);

module.exports = router;
