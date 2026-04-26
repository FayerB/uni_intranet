const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Leer el token de los headers (usualmente viene como "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No hay token, autorización denegada' });
  }

  const token = authHeader.split(' ')[1]; // Extraemos solo el token, quitando la palabra "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_por_defecto');
    req.user = decoded; // Guardamos los datos del usuario decodificado en la petición
    next(); // El token es válido, permitimos el paso al controlador
  } catch (error) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = authMiddleware;