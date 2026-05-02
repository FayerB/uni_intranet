const { Router } = require('express');
const ctrl = require('./pagos.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();
router.use(auth);

router.get('/mis-pagos',                           role('estudiante','padre'), ctrl.getMios);
router.get('/conceptos',                           ctrl.getConceptos);
router.post('/conceptos',                          role('admin'), ctrl.createConcepto);
router.get('/',                                    role('admin'), ctrl.getAll);
router.get('/estudiante/:estudianteId',            role('admin','padre'), ctrl.getByEstudiante);
router.post('/',                                   role('admin'), ctrl.create);
router.patch('/:id/registrar',                     role('admin'), ctrl.registrar);

module.exports = router;
