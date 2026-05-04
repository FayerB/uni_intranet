const usuariosService = require('./usuarios.service');

const getAll = async (req, res) => {
  try {
    const usuarios = await usuariosService.getAll(req.query);
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const usuario = await usuariosService.getById(req.params.id);
    res.json(usuario);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const create = async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({
      message: 'Campos requeridos: nombre, apellido, email, password',
    });
  }

  try {
    const usuario = await usuariosService.create({ nombre, apellido, email, password, rol });
    res.status(201).json(usuario);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const usuario = await usuariosService.update(req.params.id, req.body);
    res.json(usuario);
  } catch (error) {
    const status = error.message === 'Usuario no encontrado' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await usuariosService.remove(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { actual, nueva } = req.body;
    if (!actual || !nueva) return res.status(400).json({ message: 'actual y nueva son requeridos' });
    if (nueva.length < 6) return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    const result = await usuariosService.changePassword(req.user.id, { actual, nueva });
    res.json(result);
  } catch (error) {
    const status = error.message === 'Contraseña actual incorrecta' ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove, changePassword };
