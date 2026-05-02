const { Router } = require('express');
const ctrl = require('./horarios.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { validate, schemas } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(auth);

router.get('/mio',            ctrl.getMio);
router.get('/curso/:cursoId', ctrl.getByCurso);
router.post('/',   role('admin', 'docente'), validate(schemas.horario), ctrl.create);
router.put('/:id', role('admin', 'docente'), ctrl.update);
router.delete('/:id', role('admin'),         ctrl.remove);

module.exports = router;
