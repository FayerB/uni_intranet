const { Router } = require('express');
const ctrl = require('./recursos.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { validate, schemas } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(auth);

router.get('/categorias',             ctrl.getCategorias);
router.post('/categorias', role('admin'), ctrl.createCategoria);
router.get('/',                       ctrl.getAll);
router.get('/:id',                    ctrl.getById);
router.post('/', role('admin','docente'), validate(schemas.recurso), ctrl.create);
router.post('/:id/descargar',         ctrl.descargar);
router.delete('/:id', role('admin','docente'), ctrl.remove);

module.exports = router;
