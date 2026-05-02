const pool = require('../../config/db');

const getConversaciones = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT c.id, c.tipo, c.nombre, c.updated_at,
       -- Último mensaje
       (SELECT contenido FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS ultimo_mensaje,
       (SELECT created_at FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS ultimo_mensaje_at,
       -- No leídos
       (SELECT COUNT(*)::int FROM mensajes m
        WHERE m.conversacion_id = c.id
          AND m.created_at > COALESCE(pc.ultimo_leido, '1970-01-01')
          AND m.remitente_id != $1) AS no_leidos,
       -- Participantes (para directa: el otro)
       ARRAY_AGG(DISTINCT u.nombre || ' ' || u.apellido) FILTER (WHERE u.id != $1) AS otros_nombres
     FROM conversaciones c
     JOIN participantes_conversacion pc ON pc.conversacion_id = c.id AND pc.usuario_id = $1
     JOIN participantes_conversacion pc2 ON pc2.conversacion_id = c.id
     JOIN usuarios u ON u.id = pc2.usuario_id
     GROUP BY c.id, pc.ultimo_leido
     ORDER BY c.updated_at DESC`,
    [usuario_id]
  );
  return rows;
};

const getMensajes = async (conversacion_id, usuario_id, { limit = 50, before } = {}) => {
  // Verificar participante
  const { rows: [p] } = await pool.query(
    'SELECT 1 FROM participantes_conversacion WHERE conversacion_id = $1 AND usuario_id = $2',
    [conversacion_id, usuario_id]
  );
  if (!p) throw new Error('No eres participante de esta conversación');

  let query = `
    SELECT m.*, u.nombre || ' ' || u.apellido AS remitente_nombre, u.avatar_url
    FROM mensajes m JOIN usuarios u ON u.id = m.remitente_id
    WHERE m.conversacion_id = $1
  `;
  const params = [conversacion_id];
  if (before) { params.push(before); query += ` AND m.created_at < $${params.length}`; }
  params.push(limit);
  query += ` ORDER BY m.created_at DESC LIMIT $${params.length}`;

  const { rows } = await pool.query(query, params);

  // Marcar como leído
  await pool.query(
    'UPDATE participantes_conversacion SET ultimo_leido = NOW() WHERE conversacion_id = $1 AND usuario_id = $2',
    [conversacion_id, usuario_id]
  );
  return rows.reverse();
};

const getOCrearDirecta = async (usuario1_id, usuario2_id) => {
  // Buscar conversación directa existente
  const { rows } = await pool.query(
    `SELECT c.id FROM conversaciones c
     JOIN participantes_conversacion p1 ON p1.conversacion_id = c.id AND p1.usuario_id = $1
     JOIN participantes_conversacion p2 ON p2.conversacion_id = c.id AND p2.usuario_id = $2
     WHERE c.tipo = 'directa'
     LIMIT 1`,
    [usuario1_id, usuario2_id]
  );
  if (rows[0]) return rows[0].id;

  // Crear nueva
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [c] } = await client.query(
      "INSERT INTO conversaciones (tipo) VALUES ('directa') RETURNING id"
    );
    await client.query(
      'INSERT INTO participantes_conversacion (conversacion_id, usuario_id) VALUES ($1,$2),($1,$3)',
      [c.id, usuario1_id, usuario2_id]
    );
    await client.query('COMMIT');
    return c.id;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const enviarMensaje = async (conversacion_id, remitente_id, { contenido, archivo_id }, io) => {
  const { rows: [p] } = await pool.query(
    'SELECT 1 FROM participantes_conversacion WHERE conversacion_id = $1 AND usuario_id = $2',
    [conversacion_id, remitente_id]
  );
  if (!p) throw new Error('No eres participante de esta conversación');

  const { rows: [m] } = await pool.query(
    `INSERT INTO mensajes (conversacion_id, remitente_id, contenido, archivo_id)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [conversacion_id, remitente_id, contenido, archivo_id || null]
  );
  await pool.query(
    "UPDATE conversaciones SET updated_at = NOW() WHERE id = $1",
    [conversacion_id]
  );

  // Emitir por WebSocket
  if (io) io.to(`conv_${conversacion_id}`).emit('nuevo_mensaje', m);

  return m;
};

module.exports = { getConversaciones, getMensajes, getOCrearDirecta, enviarMensaje };
