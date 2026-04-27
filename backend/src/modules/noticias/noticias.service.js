const pool = require('../../config/db');

const format = (n) => ({
  id:        n.id,
  title:     n.titulo,
  excerpt:   n.resumen,
  content:   n.contenido,
  category:  n.categoria,
  image:     n.imagen_url,
  author:    n.autor_nombre ? `${n.autor_nombre} ${n.autor_apellido}` : 'Sistema',
  autor_id:  n.autor_id,
  publicado: n.publicado,
  date: new Date(n.created_at).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  }),
});

const BASE_SELECT = `
  SELECT n.*, u.nombre AS autor_nombre, u.apellido AS autor_apellido
  FROM noticias n
  LEFT JOIN usuarios u ON u.id = n.autor_id
`;

const getAll = async ({ categoria } = {}) => {
  let query = BASE_SELECT + ' WHERE n.publicado = true';
  const params = [];

  if (categoria && categoria !== 'Todas') {
    params.push(categoria);
    query += ` AND n.categoria = $${params.length}`;
  }

  query += ' ORDER BY n.created_at DESC';
  const { rows } = await pool.query(query, params);
  return rows.map(format);
};

const getById = async (id) => {
  const { rows } = await pool.query(BASE_SELECT + ' WHERE n.id = $1', [id]);
  if (!rows[0]) throw new Error('Noticia no encontrada');
  return format(rows[0]);
};

const create = async ({ titulo, resumen, contenido, categoria, imagen_url, autor_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO noticias (titulo, resumen, contenido, categoria, imagen_url, autor_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [titulo, resumen, contenido, categoria || 'General', imagen_url || null, autor_id]
  );
  const full = await pool.query(BASE_SELECT + ' WHERE n.id = $1', [rows[0].id]);
  return format(full.rows[0]);
};

const update = async (id, data) => {
  const allowed = ['titulo', 'resumen', 'contenido', 'categoria', 'imagen_url', 'publicado'];
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
    `UPDATE noticias SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (!rows[0]) throw new Error('Noticia no encontrada');

  const full = await pool.query(BASE_SELECT + ' WHERE n.id = $1', [id]);
  return format(full.rows[0]);
};

const remove = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM noticias WHERE id = $1 RETURNING id', [id]
  );
  if (!rows[0]) throw new Error('Noticia no encontrada');
  return { message: 'Noticia eliminada' };
};

module.exports = { getAll, getById, create, update, remove };
