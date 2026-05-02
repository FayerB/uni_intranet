const { Router } = require('express');
const ctrl = require('./clases.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { validate, schemas } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(auth);

router.get('/',                  ctrl.getAll);
router.get('/proximas',          ctrl.getProximas);
router.get('/curso/:cursoId',    ctrl.getByCurso);
router.get('/:id',               ctrl.getById);
router.post('/',   role('admin', 'docente'), validate(schemas.claseVirtual), ctrl.create);
router.put('/:id', role('admin', 'docente'), ctrl.update);
router.delete('/:id', role('admin', 'docente'), ctrl.remove);

module.exports = router;
