const pool = require('../../config/db');
const { ApiError } = require('../../utils/apiError');

const DEST_FOR_ROLE = {
  admin:      ['todos', 'docentes', 'estudiantes'],
  docente:    ['todos', 'docentes'],
  estudiante: ['todos', 'estudiantes'],
  padre:      ['todos'],
};

const getAll = async (userId, role) => {
  const allowed = DEST_FOR_ROLE[role] || ['todos'];
  const placeholders = allowed.map((_, i) => `$${i + 2}`).join(', ');

  const { rows } = await pool.query(
    `SELECT
       c.id, c.titulo, c.contenido, c.destinatario, c.created_at,
       u.nombre || ' ' || u.apellido AS autor,
       cl.leida_en IS NOT NULL AS leida
     FROM circulares c
     JOIN usuarios u ON u.id = c.autor_id
     LEFT JOIN circulares_leidas cl ON cl.circular_id = c.id AND cl.usuario_id = $1
     WHERE c.activo = true AND c.destinatario IN (${placeholders})
     ORDER BY c.created_at DESC`,
    [userId, ...allowed]
  );
  return rows;
};

const create = async ({ titulo, contenido, destinatario = 'todos' }, autorId) => {
  const { rows } = await pool.query(
    `INSERT INTO circulares (titulo, contenido, destinatario, autor_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [titulo, contenido, destinatario, autorId]
  );
  return rows[0];
};

const marcarLeida = async (circularId, userId) => {
  await pool.query(
    `INSERT INTO circulares_leidas (circular_id, usuario_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [circularId, userId]
  );
};

const remove = async (id, userId, role) => {
  const { rows } = await pool.query('SELECT autor_id FROM circulares WHERE id = $1', [id]);
  if (!rows.length) throw ApiError.notFound('Circular no encontrada');
  if (role !== 'admin' && rows[0].autor_id !== userId) {
    throw ApiError.forbidden('No puedes eliminar esta circular');
  }
  await pool.query('UPDATE circulares SET activo = false WHERE id = $1', [id]);
};

module.exports = { getAll, create, marcarLeida, remove };
