const { Router } = require('express');
const ctrl = require('./matriculas.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();

router.use(auth);

router.get('/',       ctrl.getAll);
router.post('/',      ctrl.enroll);
router.delete('/:id', role('admin'), ctrl.remove);

module.exports = router;
