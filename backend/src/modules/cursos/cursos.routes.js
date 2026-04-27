const { Router } = require('express');
const ctrl = require('./cursos.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();

router.use(auth);

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getById);
router.post('/',    role('admin', 'docente'), ctrl.create);
router.put('/:id',  role('admin', 'docente'), ctrl.update);
router.delete('/:id', role('admin'),          ctrl.remove);

module.exports = router;
