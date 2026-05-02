const pool = require('../../config/db');

const BASE = `
  SELECT cv.*,
    c.nombre AS curso_nombre,
    u.nombre || ' ' || u.apellido AS creado_por_nombre
  FROM clases_virtuales cv
  JOIN cursos c ON c.id = cv.curso_id
  JOIN usuarios u ON u.id = cv.creado_por
`;

const fmt = (r) => ({
  id:            r.id,
  curso_id:      r.curso_id,
  curso:         r.curso_nombre,
  titulo:        r.titulo,
  descripcion:   r.descripcion,
  url_reunion:   r.url_reunion,
  plataforma:    r.plataforma,
  fecha_inicio:  r.fecha_inicio,
  fecha_fin:     r.fecha_fin,
  grabacion_url: r.grabacion_url,
  estado:        r.estado,
  creado_por:    r.creado_por_nombre,
  created_at:    r.created_at,
});

const getAll = async (usuario_id, rol) => {
  let query = BASE;
  const params = [];

  if (rol === 'estudiante') {
    query += ` WHERE cv.curso_id IN (
      SELECT curso_id FROM matriculas WHERE estudiante_id = $1 AND estado = 'activo'
    )`;
    params.push(usuario_id);
  } else if (rol === 'docente') {
    params.push(usuario_id);
    query += ' WHERE c.docente_id = $1';
  }
  // admin ve todo sin filtro

  query += ' ORDER BY cv.fecha_inicio DESC';
  const { rows } = await pool.query(query, params);
  return rows.map(fmt);
};

const getByCurso = async (curso_id) => {
  const { rows } = await pool.query(
    BASE + ' WHERE cv.curso_id = $1 ORDER BY cv.fecha_inicio DESC',
    [curso_id]
  );
  return rows.map(fmt);
};

const getProximas = async (usuario_id, rol) => {
  let query = BASE + `
    WHERE cv.fecha_inicio >= NOW()
      AND cv.estado IN ('programada', 'en_curso')
  `;
  const params = [];
  if (rol === 'estudiante') {
    query += ` AND cv.curso_id IN (
      SELECT curso_id FROM matriculas WHERE estudiante_id = $1 AND estado = 'activo'
    )`;
    params.push(usuario_id);
  } else if (rol === 'docente') {
    query += ' AND c.docente_id = $1';
    params.push(usuario_id);
  }
  query += ' ORDER BY cv.fecha_inicio ASC LIMIT 10';
  const { rows } = await pool.query(query, params);
  return rows.map(fmt);
};

const getById = async (id) => {
  const { rows } = await pool.query(BASE + ' WHERE cv.id = $1', [id]);
  if (!rows[0]) throw new Error('Clase no encontrada');
  return fmt(rows[0]);
};

const create = async (data, creado_por) => {
  const { curso_id, titulo, descripcion, url_reunion, plataforma, fecha_inicio, fecha_fin } = data;
  const { rows } = await pool.query(
    `INSERT INTO clases_virtuales
       (curso_id, titulo, descripcion, url_reunion, plataforma, fecha_inicio, fecha_fin, creado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [curso_id, titulo, descripcion || null, url_reunion || null,
     plataforma || 'zoom', fecha_inicio, fecha_fin || null, creado_por]
  );
  return getById(rows[0].id);
};

const update = async (id, data) => {
  const allowed = ['titulo', 'descripcion', 'url_reunion', 'plataforma', 'fecha_inicio', 'fecha_fin', 'grabacion_url', 'estado'];
  const fields = [], params = [];
  for (const k of allowed) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${k} = $${params.length}`); }
  }
  if (!fields.length) throw new Error('Nada que actualizar');
  params.push(id);
  await pool.query(`UPDATE clases_virtuales SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`, params);
  return getById(id);
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM clases_virtuales WHERE id = $1 RETURNING id', [id]);
  if (!rows[0]) throw new Error('Clase no encontrada');
  return { message: 'Clase eliminada' };
};

module.exports = { getAll, getByCurso, getProximas, getById, create, update, remove };
