const { Router } = require('express');
const ctrl = require('./mensajeria.controller');
const auth = require('../../middlewares/auth.middleware');
const { validate, schemas } = require('../../middlewares/validate.middleware');

const router = Router();
router.use(auth);

router.get('/',                    ctrl.getConversaciones);
router.post('/iniciar',            ctrl.iniciarDirecta);
router.get('/:id/mensajes',        ctrl.getMensajes);
router.post('/:id/mensajes',       validate(schemas.mensaje), ctrl.enviar);

module.exports = router;
