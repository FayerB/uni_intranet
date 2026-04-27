const { Router } = require('express');
const noticiasController = require('./noticias.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/',    noticiasController.getAll);
router.get('/:id', noticiasController.getById);
router.post('/',   roleMiddleware('admin', 'docente'), noticiasController.create);
router.put('/:id', roleMiddleware('admin', 'docente'), noticiasController.update);
router.delete('/:id', roleMiddleware('admin'),         noticiasController.remove);

module.exports = router;
