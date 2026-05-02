const pool = require('../../config/db');
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../../middlewares/upload.middleware');

const guardar = async (file, { subido_por, entidad_tipo, entidad_id } = {}) => {
  const url = `/uploads/${file.filename}`;
  const { rows } = await pool.query(
    `INSERT INTO archivos
       (nombre, nombre_original, mime_type, tamano, url, storage_key, subido_por, entidad_tipo, entidad_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [file.filename, file.originalname, file.mimetype, file.size,
     url, file.filename, subido_por, entidad_tipo || null, entidad_id || null]
  );
  return rows[0];
};

const getById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM archivos WHERE id = $1', [id]);
  return rows[0] || null;
};

const eliminar = async (id, usuario_id) => {
  const { rows } = await pool.query(
    'DELETE FROM archivos WHERE id = $1 AND subido_por = $2 RETURNING storage_key',
    [id, usuario_id]
  );
  if (!rows[0]) throw new Error('Archivo no encontrado o sin permisos');

  // Eliminar archivo físico
  const filePath = path.join(UPLOAD_DIR, rows[0].storage_key);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { message: 'Archivo eliminado' };
};

module.exports = { guardar, getById, eliminar };
