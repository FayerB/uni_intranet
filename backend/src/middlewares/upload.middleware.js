const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads');

// Asegurar que el directorio exista
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'application/zip',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  }
};

/** Subida de archivo único — máx 25 MB */
const single = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
}).single('file');

/** Subida de múltiples archivos — máx 5 archivos de 25 MB */
const multiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
}).array('files', 5);

/** Wrapper para capturar errores de multer como middleware estándar */
const wrap = (handler) => (req, res, next) => {
  handler(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

module.exports = {
  single:   wrap(single),
  multiple: wrap(multiple),
  UPLOAD_DIR,
};
