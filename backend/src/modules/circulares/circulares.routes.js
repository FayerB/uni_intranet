const { Router } = require('express');
const ctrl   = require('./circulares.controller');
const auth   = require('../../middlewares/auth.middleware');
const role   = require('../../middlewares/role.middleware');

const router = Router();

router.use(auth);

router.get('/',          ctrl.getAll);
router.post('/',         role('admin', 'docente'), ctrl.create);
router.patch('/:id/leer', ctrl.marcarLeida);
router.delete('/:id',    role('admin', 'docente'), ctrl.remove);

module.exports = router;
