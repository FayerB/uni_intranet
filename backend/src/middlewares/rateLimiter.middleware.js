const rateLimit = require('express-rate-limit');

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes. Intente de nuevo más tarde.' },
};

/** Límite general: 200 req/15 min por IP */
const general = rateLimit({ ...base, windowMs: 15 * 60 * 1000, max: 200 });

/** Login/registro: 10 intentos/15 min por IP (anti brute-force) */
const auth = rateLimit({ ...base, windowMs: 15 * 60 * 1000, max: 10 });

/** Subida de archivos: 20 uploads/hora por IP */
const upload = rateLimit({ ...base, windowMs: 60 * 60 * 1000, max: 20 });

/** Generación de reportes: 10/hora por IP */
const reports = rateLimit({ ...base, windowMs: 60 * 60 * 1000, max: 10 });

module.exports = { general, auth, upload, reports };
