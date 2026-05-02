const { Router } = require('express');
const ctrl = require('./tareas.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { validate, schemas } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(auth);

// Tareas
router.get('/mias',            ctrl.getMias);
router.get('/curso/:cursoId',  ctrl.getByCurso);
router.get('/:id',             ctrl.getById);
router.post('/',   role('admin', 'docente'), validate(schemas.tarea), ctrl.create);
router.put('/:id', role('admin', 'docente'), ctrl.update);
router.delete('/:id', role('admin', 'docente'), ctrl.remove);

// Entregas de una tarea específica
router.get('/:id/entregas',                          role('admin', 'docente'), ctrl.getEntregas);
router.get('/:id/mi-entrega',                        role('estudiante'),       ctrl.getMiEntrega);
router.post('/:id/entregar',                         role('estudiante'),       validate(schemas.entrega), ctrl.entregar);
router.put('/:id/entregas/:entregaId/calificar',     role('admin', 'docente'), validate(schemas.calificarEntrega), ctrl.calificar);

module.exports = router;
