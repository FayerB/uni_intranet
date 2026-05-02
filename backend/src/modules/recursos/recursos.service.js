const pool = require('../../config/db');
const { paginate } = require('../../utils/pagination');

const BASE = `
  SELECT r.*,
    u.nombre || ' ' || u.apellido AS subido_por_nombre,
    c.nombre AS curso_nombre,
    cat.nombre AS categoria_nombre, cat.color AS categoria_color,
    a.url AS archivo_url, a.tamano AS archivo_tamano,
    ARRAY_AGG(e.nombre) FILTER (WHERE e.nombre IS NOT NULL) AS etiquetas
  FROM recursos r
  JOIN usuarios u ON u.id = r.subido_por
  LEFT JOIN cursos c ON c.id = r.curso_id
  LEFT JOIN categorias_recurso cat ON cat.id = r.categoria_id
  LEFT JOIN archivos a ON a.id = r.archivo_id
  LEFT JOIN recurso_etiquetas re ON re.recurso_id = r.id
  LEFT JOIN etiquetas e ON e.id = re.etiqueta_id
`;
const GROUP = 'GROUP BY r.id, u.nombre, u.apellido, c.nombre, cat.nombre, cat.color, a.url, a.tamano';

const fmt = (r) => ({
  id:              r.id,
  titulo:          r.titulo,
  descripcion:     r.descripcion,
  tipo:            r.tipo,
  url:             r.url || r.archivo_url,
  tamano:          r.archivo_tamano,
  curso_id:        r.curso_id,
  curso:           r.curso_nombre,
  categoria:       r.categoria_nombre,
  categoria_color: r.categoria_color,
  subido_por:      r.subido_por_nombre,
  publicado:       r.publicado,
  descargas:       r.descargas,
  etiquetas:       r.etiquetas || [],
  created_at:      r.created_at,
});

const getAll = async ({ search, tipo, curso_id, categoria_id, page, limit } = {}) => {
  const { limit: lim, offset, meta } = paginate({ page, limit });
  let where = 'WHERE r.publicado = true';
  const params = [];

  if (search) {
    params.push(search);
    where += ` AND (r.titulo ILIKE $${params.length} OR r.descripcion ILIKE $${params.length})`;
  }
  if (tipo)        { params.push(tipo);        where += ` AND r.tipo = $${params.length}`; }
  if (curso_id)    { params.push(curso_id);    where += ` AND r.curso_id = $${params.length}`; }
  if (categoria_id){ params.push(categoria_id); where += ` AND r.categoria_id = $${params.length}`; }

  const countQ = `SELECT COUNT(DISTINCT r.id)::int FROM recursos r ${where}`;
  const { rows: [{ count }] } = await pool.query(countQ, params);

  params.push(lim, offset);
  const dataQ = BASE + where + ' ' + GROUP + ` ORDER BY r.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await pool.query(dataQ, params);
  return { data: rows.map(fmt), meta: meta(count) };
};

const getById = async (id) => {
  const { rows } = await pool.query(BASE + ' WHERE r.id = $1 ' + GROUP, [id]);
  if (!rows[0]) throw new Error('Recurso no encontrado');
  return fmt(rows[0]);
};

const create = async (data, subido_por) => {
  const { titulo, descripcion, tipo, url, archivo_id, curso_id, categoria_id, publicado = true, etiquetas = [] } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [r] } = await client.query(
      `INSERT INTO recursos (titulo, descripcion, tipo, url, archivo_id, curso_id, categoria_id, subido_por, publicado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [titulo, descripcion || null, tipo, url || null, archivo_id || null,
       curso_id || null, categoria_id || null, subido_por, publicado]
    );
    for (const nombre of etiquetas) {
      const { rows: [e] } = await client.query(
        "INSERT INTO etiquetas (nombre) VALUES ($1) ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id",
        [nombre.trim().toLowerCase()]
      );
      await client.query('INSERT INTO recurso_etiquetas VALUES ($1,$2) ON CONFLICT DO NOTHING', [r.id, e.id]);
    }
    await client.query('COMMIT');
    return getById(r.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const registrarDescarga = async (id) => {
  await pool.query('UPDATE recursos SET descargas = descargas + 1 WHERE id = $1', [id]);
};

const remove = async (id) => {
  await pool.query('DELETE FROM recursos WHERE id = $1', [id]);
  return { message: 'Recurso eliminado' };
};

const getCategorias = async () => {
  const { rows } = await pool.query('SELECT * FROM categorias_recurso ORDER BY nombre');
  return rows;
};

const createCategoria = async ({ nombre, color }) => {
  const { rows } = await pool.query(
    'INSERT INTO categorias_recurso (nombre, color) VALUES ($1,$2) ON CONFLICT (nombre) DO UPDATE SET color = $2 RETURNING *',
    [nombre, color || '#3B82F6']
  );
  return rows[0];
};

module.exports = { getAll, getById, create, registrarDescarga, remove, getCategorias, createCategoria };
