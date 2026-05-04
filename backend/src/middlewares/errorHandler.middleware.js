const { ApiError } = require('../utils/apiError');

const errorHandler = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, errors: err.errors });
  }

  // PostgreSQL: tabla no existe aún (schema pendiente de aplicar)
  if (err.code === '42P01') {
    if (req.method === 'GET') return res.json([]);
    return res.status(503).json({ message: 'Módulo en configuración. Contacta al administrador.' });
  }

  // PostgreSQL: UUID inválido recibido como parámetro
  if (err.code === '22P02') return res.status(400).json({ message: 'ID con formato inválido' });

  // PostgreSQL constraint violations
  if (err.code === '23505') return res.status(409).json({ message: 'El registro ya existe (duplicado)' });
  if (err.code === '23503') return res.status(400).json({ message: 'Referencia inválida (clave foránea)' });
  if (err.code === '23514') return res.status(400).json({ message: 'Valor fuera del rango permitido' });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'El archivo supera el tamaño máximo permitido' });
  if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ message: 'Campo de archivo inesperado' });

  console.error('[ERROR]', err);
  res.status(500).json({ message: 'Error interno del servidor' });
};

module.exports = errorHandler;
