const { Router } = require('express');
const usuariosController = require('./usuarios.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const router = Router();

router.use(authMiddleware);

router.patch('/perfil/password', usuariosController.changePassword);
router.get('/', usuariosController.getAll);
router.get('/:id', usuariosController.getById);
router.post('/', roleMiddleware('admin'), usuariosController.create);
router.put('/:id', roleMiddleware('admin'), usuariosController.update);
router.delete('/:id', roleMiddleware('admin'), usuariosController.remove);

module.exports = router;
