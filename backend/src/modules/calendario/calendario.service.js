const pool = require('../../config/db');

const getEventos = async ({ usuario_id, rol, desde, hasta, curso_id } = {}) => {
  let query = `
    SELECT e.*, c.nombre AS curso_nombre,
      u.nombre || ' ' || u.apellido AS creado_por_nombre
    FROM eventos_calendario e
    LEFT JOIN cursos c ON c.id = e.curso_id
    JOIN usuarios u ON u.id = e.creado_por
    WHERE (e.es_global = true
  `;
  const params = [];

  if (rol === 'estudiante') {
    params.push(usuario_id);
    query += ` OR e.curso_id IN (
      SELECT curso_id FROM matriculas WHERE estudiante_id = $${params.length} AND estado = 'activo'
    )`;
  } else if (rol === 'docente') {
    params.push(usuario_id);
    query += ` OR c.docente_id = $${params.length}`;
  }
  // admin ve todo
  if (rol !== 'admin') {
    params.push(usuario_id);
    query += ` OR e.creado_por = $${params.length}`;
  }
  query += ')';

  if (desde) { params.push(desde); query += ` AND e.fecha_inicio >= $${params.length}`; }
  if (hasta)  { params.push(hasta);  query += ` AND e.fecha_inicio <= $${params.length}`; }
  if (curso_id){ params.push(curso_id); query += ` AND e.curso_id = $${params.length}`; }

  query += ' ORDER BY e.fecha_inicio ASC';
  const { rows } = await pool.query(query, params);
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT e.*, c.nombre AS curso_nombre
     FROM eventos_calendario e LEFT JOIN cursos c ON c.id = e.curso_id
     WHERE e.id = $1`,
    [id]
  );
  if (!rows[0]) throw new Error('Evento no encontrado');
  return rows[0];
};

const create = async (data, creado_por) => {
  const { titulo, descripcion, tipo, fecha_inicio, fecha_fin, todo_el_dia, curso_id, es_global, color } = data;
  const { rows } = await pool.query(
    `INSERT INTO eventos_calendario
       (titulo, descripcion, tipo, fecha_inicio, fecha_fin, todo_el_dia, curso_id, creado_por, es_global, color)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [titulo, descripcion || null, tipo || 'academico', fecha_inicio, fecha_fin || null,
     todo_el_dia ?? false, curso_id || null, creado_por, es_global ?? false, color || '#3B82F6']
  );
  return getById(rows[0].id);
};

const update = async (id, data) => {
  const allowed = ['titulo', 'descripcion', 'tipo', 'fecha_inicio', 'fecha_fin', 'todo_el_dia', 'curso_id', 'es_global', 'color'];
  const fields = [], params = [];
  for (const k of allowed) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${k} = $${params.length}`); }
  }
  if (!fields.length) throw new Error('Nada que actualizar');
  params.push(id);
  await pool.query(`UPDATE eventos_calendario SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`, params);
  return getById(id);
};

const remove = async (id) => {
  await pool.query('DELETE FROM eventos_calendario WHERE id = $1', [id]);
  return { message: 'Evento eliminado' };
};

module.exports = { getEventos, getById, create, update, remove };
