const { Router } = require('express');
const ctrl = require('./soporte.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');
const { validate, schemas } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(auth);

router.get('/mios',           ctrl.getMios);
router.get('/',               role('admin'), ctrl.getAll);
router.get('/:id',            ctrl.getById);
router.post('/',              validate(schemas.ticket), ctrl.create);
router.post('/:id/responder', ctrl.responder);
router.patch('/:id/estado',   role('admin'), ctrl.cambiarEstado);

module.exports = router;
