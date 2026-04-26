const express = require('express');
const router = express.Router();
const { getUsuarios, getUsuarioById, deleteUsuario, updateUsuario } = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Todas las rutas de este archivo estarán protegidas por el middleware
router.get('/', authMiddleware, getUsuarios);

// Ruta para ver un solo usuario (Cualquier usuario logueado puede verlo)
router.get('/:id', authMiddleware, getUsuarioById);

// Ruta protegida doblemente: Solo los administradores pueden eliminar
router.delete('/:id', authMiddleware, adminMiddleware, deleteUsuario);

// Ruta para actualizar usuario
router.put('/:id', authMiddleware, adminMiddleware, updateUsuario);

module.exports = router;