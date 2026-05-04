const authService = require('./auth.service');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getPerfil = async (req, res, next) => {
  try {
    const perfil = await authService.getPerfil(req.user.id);
    res.json(perfil);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getPerfil };
