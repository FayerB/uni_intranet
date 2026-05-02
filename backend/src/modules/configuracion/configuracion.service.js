const pool = require('../../config/db');

const getAll = async (categoria) => {
  let query = 'SELECT * FROM configuracion_sistema';
  const params = [];
  if (categoria) { params.push(categoria); query += ' WHERE categoria = $1'; }
  query += ' ORDER BY categoria, clave';
  const { rows } = await pool.query(query, params);

  // Agrupar por categoría
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.categoria]) grouped[row.categoria] = {};
    grouped[row.categoria][row.clave] = row;
  }
  return grouped;
};

const get = async (clave) => {
  const { rows } = await pool.query('SELECT valor FROM configuracion_sistema WHERE clave = $1', [clave]);
  return rows[0]?.valor ?? null;
};

const set = async (clave, valor) => {
  const { rows } = await pool.query(
    `UPDATE configuracion_sistema SET valor = $1, updated_at = NOW() WHERE clave = $2 RETURNING *`,
    [valor, clave]
  );
  if (!rows[0]) throw new Error(`Clave '${clave}' no encontrada`);
  return rows[0];
};

const setBulk = async (updates) => {
  const results = [];
  for (const [clave, valor] of Object.entries(updates)) {
    try {
      const r = await set(clave, String(valor));
      results.push(r);
    } catch (_) { /* ignorar claves inválidas */ }
  }
  return results;
};

const getPeriodoActivo = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM periodos_academicos WHERE activo = true LIMIT 1'
  );
  return rows[0] || null;
};

const setPeriodoActivo = async (periodo_id) => {
  await pool.query('UPDATE periodos_academicos SET activo = false');
  const { rows } = await pool.query(
    'UPDATE periodos_academicos SET activo = true WHERE id = $1 RETURNING *',
    [periodo_id]
  );
  if (!rows[0]) throw new Error('Período no encontrado');
  return rows[0];
};

const getPeriodos = async () => {
  const { rows } = await pool.query('SELECT * FROM periodos_academicos ORDER BY fecha_inicio DESC');
  return rows;
};

const createPeriodo = async ({ nombre, fecha_inicio, fecha_fin }) => {
  const { rows } = await pool.query(
    'INSERT INTO periodos_academicos (nombre, fecha_inicio, fecha_fin) VALUES ($1,$2,$3) RETURNING *',
    [nombre, fecha_inicio, fecha_fin]
  );
  return rows[0];
};

module.exports = { getAll, get, set, setBulk, getPeriodoActivo, setPeriodoActivo, getPeriodos, createPeriodo };
