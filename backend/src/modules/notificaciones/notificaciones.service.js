const pool = require('../../config/db');

const getByUsuario = async (usuario_id, { solo_no_leidas = false, limit = 30 } = {}) => {
  let query = 'SELECT * FROM notificaciones WHERE usuario_id = $1';
  const params = [usuario_id];
  if (solo_no_leidas) query += ' AND leida = false';
  params.push(limit);
  query += ` ORDER BY created_at DESC LIMIT $${params.length}`;
  const { rows } = await pool.query(query, params);
  return rows;
};

const countNoLeidas = async (usuario_id) => {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM notificaciones WHERE usuario_id = $1 AND leida = false',
    [usuario_id]
  );
  return rows[0].count;
};

const marcarLeida = async (id, usuario_id) => {
  await pool.query(
    'UPDATE notificaciones SET leida = true WHERE id = $1 AND usuario_id = $2',
    [id, usuario_id]
  );
  return { ok: true };
};

const marcarTodasLeidas = async (usuario_id) => {
  const { rowCount } = await pool.query(
    'UPDATE notificaciones SET leida = true WHERE usuario_id = $1 AND leida = false',
    [usuario_id]
  );
  return { actualizadas: rowCount };
};

/**
 * Crear notificación y emitirla vía Socket.IO si está disponible.
 * @param {object} data - { usuario_id, titulo, mensaje, tipo, url_accion, entidad_tipo, entidad_id }
 * @param {import('socket.io').Server} [io]
 */
const crear = async (data, io = null) => {
  const { usuario_id, titulo, mensaje, tipo = 'info', url_accion, entidad_tipo, entidad_id } = data;
  const { rows: [n] } = await pool.query(
    `INSERT INTO notificaciones
       (usuario_id, titulo, mensaje, tipo, url_accion, entidad_tipo, entidad_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [usuario_id, titulo, mensaje, tipo, url_accion || null, entidad_tipo || null, entidad_id || null]
  );
  if (io) io.to(`user_${usuario_id}`).emit('notificacion', n);
  return n;
};

/** Crear notificaciones masivas para todos los matriculados en un curso */
const crearMasiva = async ({ curso_id, titulo, mensaje, tipo, url_accion, entidad_tipo, entidad_id }, io = null) => {
  const { rows: matriculados } = await pool.query(
    "SELECT estudiante_id FROM matriculas WHERE curso_id = $1 AND estado = 'activo'",
    [curso_id]
  );
  for (const { estudiante_id } of matriculados) {
    await crear({ usuario_id: estudiante_id, titulo, mensaje, tipo, url_accion, entidad_tipo, entidad_id }, io);
  }
  return { enviadas: matriculados.length };
};

const eliminar = async (id, usuario_id) => {
  await pool.query('DELETE FROM notificaciones WHERE id = $1 AND usuario_id = $2', [id, usuario_id]);
  return { ok: true };
};

module.exports = { getByUsuario, countNoLeidas, marcarLeida, marcarTodasLeidas, crear, crearMasiva, eliminar };
