const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(String(password).trim(), user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPerfil = async (req, res) => {
  try {
    // req.user contiene los datos decodificados del token gracias al middleware
    res.json({ message: 'Ruta protegida alcanzada con éxito', user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;

  // Validar que se envíen los campos obligatorios
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ message: 'Los campos nombre, apellido, email y password son obligatorios' });
  }

  // Convertir el rol a minúsculas y asignar 'empleado' por defecto
  const rolNormalizado = rol ? String(rol).toLowerCase() : 'empleado';

  try {
    // Encriptar la contraseña (10 rondas de salt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password).trim(), salt);

    // Insertar el nuevo usuario en la base de datos
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, rol, activo) VALUES ($1, $2, $3, $4, $5, true) RETURNING id, nombre, email, rol',
      [nombre, apellido, email, hashedPassword, rolNormalizado]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser); // Ya le devolvemos un token para que inicie sesión de una vez

    res.status(201).json({ message: 'Usuario registrado con éxito', token, user: newUser });
  } catch (error) {
    // 23505 es el código de error de PostgreSQL para "Unique Violation"
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login, getPerfil, register };