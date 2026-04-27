const bcrypt = require('bcrypt');
const pool = require('../../config/db');
const { generateToken } = require('../../utils/jwt');

const login = async (email, password) => {
  const { rows } = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
    [email]
  );

  const usuario = rows[0];
  if (!usuario) throw new Error('Credenciales inválidas');

  const passwordMatch = await bcrypt.compare(password, usuario.password);
  if (!passwordMatch) throw new Error('Credenciales inválidas');

  const payload = { id: usuario.id, email: usuario.email, role: usuario.rol };
  const token = generateToken(payload);

  return {
    token,
    user: {
      id: usuario.id,
      name: `${usuario.nombre} ${usuario.apellido}`,
      email: usuario.email,
      role: usuario.rol,
    },
  };
};

const getPerfil = async (userId) => {
  const { rows } = await pool.query(
    'SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id = $1 AND activo = true',
    [userId]
  );

  const usuario = rows[0];
  if (!usuario) throw new Error('Usuario no encontrado');

  return {
    id: usuario.id,
    name: `${usuario.nombre} ${usuario.apellido}`,
    email: usuario.email,
    role: usuario.rol,
  };
};

module.exports = { login, getPerfil };
