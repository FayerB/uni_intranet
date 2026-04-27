const { Router } = require('express');
const ctrl = require('./notas.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();
router.use(auth);

router.get('/',  ctrl.getByCourse);
router.post('/', role('admin', 'docente'), ctrl.upsertMany);

module.exports = router;
