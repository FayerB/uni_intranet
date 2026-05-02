const { Router } = require('express');
const ctrl = require('./calendario.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { validate, schemas } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(auth);

router.get('/',        ctrl.getEventos);
router.get('/:id',     ctrl.getById);
router.post('/',       validate(schemas.evento), ctrl.create);
router.put('/:id',     ctrl.update);
router.delete('/:id',  role('admin','docente'), ctrl.remove);

module.exports = router;
