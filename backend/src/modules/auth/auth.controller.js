const authService = require('./auth.service');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const getPerfil = async (req, res) => {
  try {
    const perfil = await authService.getPerfil(req.user.id);
    res.json(perfil);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { login, getPerfil };
