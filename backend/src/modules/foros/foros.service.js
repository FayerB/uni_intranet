const pool = require('../../config/db');

// ─── Foros ────────────────────────────────────────────────────────────────────

const getForosByCurso = async (curso_id) => {
  const { rows } = await pool.query(
    `SELECT f.*, COUNT(h.id)::int AS hilos_count
     FROM foros f
     LEFT JOIN hilos_foro h ON h.foro_id = f.id
     WHERE f.curso_id = $1 AND f.activo = true
     GROUP BY f.id ORDER BY f.created_at ASC`,
    [curso_id]
  );
  return rows;
};

const createForo = async ({ curso_id, titulo, descripcion }, creado_por) => {
  const { rows } = await pool.query(
    'INSERT INTO foros (curso_id, titulo, descripcion) VALUES ($1,$2,$3) RETURNING *',
    [curso_id, titulo, descripcion || null]
  );
  return rows[0];
};

// ─── Hilos ────────────────────────────────────────────────────────────────────

const getHilosByForo = async (foro_id) => {
  const { rows } = await pool.query(
    `SELECT h.*, u.nombre || ' ' || u.apellido AS autor, u.avatar_url,
       COUNT(r.id)::int AS respuestas_count
     FROM hilos_foro h
     JOIN usuarios u ON u.id = h.autor_id
     LEFT JOIN respuestas_foro r ON r.hilo_id = h.id
     WHERE h.foro_id = $1
     GROUP BY h.id, u.nombre, u.apellido, u.avatar_url
     ORDER BY h.fijado DESC, h.updated_at DESC`,
    [foro_id]
  );
  return rows;
};

const getHiloById = async (hilo_id) => {
  const { rows } = await pool.query(
    `SELECT h.*, u.nombre || ' ' || u.apellido AS autor, u.avatar_url
     FROM hilos_foro h JOIN usuarios u ON u.id = h.autor_id WHERE h.id = $1`,
    [hilo_id]
  );
  if (!rows[0]) throw new Error('Hilo no encontrado');

  // Registrar vista
  await pool.query('UPDATE hilos_foro SET vistas = vistas + 1 WHERE id = $1', [hilo_id]);

  // Respuestas en árbol
  const { rows: respuestas } = await pool.query(
    `SELECT r.*, u.nombre || ' ' || u.apellido AS autor, u.avatar_url
     FROM respuestas_foro r JOIN usuarios u ON u.id = r.autor_id
     WHERE r.hilo_id = $1 ORDER BY r.created_at ASC`,
    [hilo_id]
  );
  return { ...rows[0], respuestas };
};

const createHilo = async (foro_id, { titulo, contenido }, autor_id) => {
  const { rows } = await pool.query(
    'INSERT INTO hilos_foro (foro_id, titulo, contenido, autor_id) VALUES ($1,$2,$3,$4) RETURNING id',
    [foro_id, titulo, contenido, autor_id]
  );
  return getHiloById(rows[0].id);
};

const responderHilo = async (hilo_id, { contenido, padre_id }, autor_id) => {
  const { rows } = await pool.query(
    'INSERT INTO respuestas_foro (hilo_id, contenido, autor_id, padre_id) VALUES ($1,$2,$3,$4) RETURNING *',
    [hilo_id, contenido, autor_id, padre_id || null]
  );
  await pool.query('UPDATE hilos_foro SET updated_at = NOW() WHERE id = $1', [hilo_id]);
  return rows[0];
};

const toggleFijado = async (hilo_id) => {
  const { rows } = await pool.query(
    'UPDATE hilos_foro SET fijado = NOT fijado WHERE id = $1 RETURNING fijado',
    [hilo_id]
  );
  return rows[0];
};

module.exports = { getForosByCurso, createForo, getHilosByForo, getHiloById, createHilo, responderHilo, toggleFijado };
