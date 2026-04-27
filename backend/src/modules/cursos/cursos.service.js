const pool = require('../../config/db');

const BASE_SELECT = `
  SELECT c.*,
    u.nombre AS docente_nombre, u.apellido AS docente_apellido,
    COUNT(m.id)::int AS students_count
  FROM cursos c
  LEFT JOIN usuarios  u ON u.id = c.docente_id
  LEFT JOIN matriculas m ON m.curso_id = c.id AND m.estado = 'activo'
`;

const GROUP_BY = 'GROUP BY c.id, u.nombre, u.apellido';

const format = (c) => ({
  id:          c.id,
  code:        c.codigo,
  name:        c.nombre,
  description: c.descripcion,
  credits:     c.creditos,
  ciclo:       c.ciclo,
  type:        c.tipo,
  image:       c.imagen_url,
  students:    c.students_count ?? 0,
  docente:     c.docente_nombre ? `${c.docente_nombre} ${c.docente_apellido}` : null,
  docente_id:  c.docente_id,
  activo:      c.activo,
});

const getAll = async ({ search, ciclo } = {}) => {
  let query = BASE_SELECT + ' WHERE c.activo = true';
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    const i = params.length;
    query += ` AND (c.nombre ILIKE $${i} OR c.codigo ILIKE $${i})`;
  }
  if (ciclo && ciclo !== 'Todos') {
    params.push(ciclo);
    query += ` AND c.ciclo = $${params.length}`;
  }

  query += ' ' + GROUP_BY + ' ORDER BY c.codigo ASC';
  const { rows } = await pool.query(query, params);
  return rows.map(format);
};

const getById = async (id) => {
  const { rows } = await pool.query(BASE_SELECT + ' WHERE c.id = $1 ' + GROUP_BY, [id]);
  if (!rows[0]) throw new Error('Curso no encontrado');
  return format(rows[0]);
};

const create = async ({ codigo, nombre, descripcion, creditos, ciclo, tipo, imagen_url, docente_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO cursos (codigo, nombre, descripcion, creditos, ciclo, tipo, imagen_url, docente_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [codigo, nombre, descripcion || null, creditos || 3, ciclo || null,
     tipo || 'Obligatorio', imagen_url || null, docente_id || null]
  );
  return getById(rows[0].id);
};

const update = async (id, data) => {
  const allowed = ['codigo', 'nombre', 'descripcion', 'creditos', 'ciclo', 'tipo', 'imagen_url', 'docente_id', 'activo'];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      params.push(data[key]);
      fields.push(`${key} = $${params.length}`);
    }
  }
  if (!fields.length) throw new Error('Nada que actualizar');

  params.push(id);
  const { rows } = await pool.query(
    `UPDATE cursos SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (!rows[0]) throw new Error('Curso no encontrado');
  return getById(id);
};

const remove = async (id) => {
  const { rows } = await pool.query(
    'UPDATE cursos SET activo = false, updated_at = NOW() WHERE id = $1 RETURNING id', [id]
  );
  if (!rows[0]) throw new Error('Curso no encontrado');
  return { message: 'Curso desactivado' };
};

module.exports = { getAll, getById, create, update, remove };
