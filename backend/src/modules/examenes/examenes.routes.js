const { Router } = require('express');
const ctrl = require('./examenes.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { validate, schemas } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(auth);

router.get('/curso/:cursoId',              ctrl.getByCurso);
router.get('/:id',                         ctrl.getById);
router.post('/',     role('admin', 'docente'), validate(schemas.examen), ctrl.create);
router.put('/:id',   role('admin', 'docente'), ctrl.update);
router.delete('/:id',role('admin', 'docente'), ctrl.remove);

// Preguntas
router.post('/:id/preguntas',                         role('admin', 'docente'), validate(schemas.pregunta), ctrl.addPregunta);
router.delete('/:id/preguntas/:preguntaId',           role('admin', 'docente'), ctrl.removePregunta);

// Rendición (estudiante)
router.post('/:id/iniciar',                           role('estudiante'),       ctrl.iniciarIntento);
router.post('/intentos/:intentoId/respuesta',         role('estudiante'),       ctrl.guardarRespuesta);
router.post('/intentos/:intentoId/finalizar',         role('estudiante'),       ctrl.finalizarIntento);

// Resultados (docente/admin)
router.get('/:id/resultados',                         role('admin', 'docente'), ctrl.getResultados);

module.exports = router;
