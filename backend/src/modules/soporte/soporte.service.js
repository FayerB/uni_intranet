const pool = require('../../config/db');
const { paginate } = require('../../utils/pagination');

const BASE = `
  SELECT t.*,
    u.nombre || ' ' || u.apellido AS usuario_nombre, u.email AS usuario_email,
    a.nombre || ' ' || a.apellido AS asignado_nombre
  FROM tickets_soporte t
  JOIN usuarios u ON u.id = t.usuario_id
  LEFT JOIN usuarios a ON a.id = t.asignado_a
`;

const fmt = (r) => ({
  id:          r.id,
  usuario:     r.usuario_nombre,
  email:       r.usuario_email,
  asunto:      r.asunto,
  descripcion: r.descripcion,
  categoria:   r.categoria,
  prioridad:   r.prioridad,
  estado:      r.estado,
  asignado_a:  r.asignado_nombre,
  resuelto_en: r.resuelto_en,
  created_at:  r.created_at,
  updated_at:  r.updated_at,
});

const getMios = async (usuario_id) => {
  const { rows } = await pool.query(
    BASE + ' WHERE t.usuario_id = $1 ORDER BY t.created_at DESC',
    [usuario_id]
  );
  return rows.map(fmt);
};

const getAll = async ({ estado, categoria, prioridad, page, limit } = {}) => {
  const { limit: lim, offset, meta } = paginate({ page, limit });
  let where = 'WHERE 1=1';
  const params = [];
  if (estado)    { params.push(estado);    where += ` AND t.estado = $${params.length}`; }
  if (categoria) { params.push(categoria); where += ` AND t.categoria = $${params.length}`; }
  if (prioridad) { params.push(prioridad); where += ` AND t.prioridad = $${params.length}`; }

  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*)::int FROM tickets_soporte t ${where}`, params
  );
  params.push(lim, offset);
  const { rows } = await pool.query(
    BASE + ` ${where} ORDER BY CASE t.prioridad WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 END, t.created_at ASC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return { data: rows.map(fmt), meta: meta(count) };
};

const getById = async (id) => {
  const { rows } = await pool.query(BASE + ' WHERE t.id = $1', [id]);
  if (!rows[0]) throw new Error('Ticket no encontrado');
  const ticket = fmt(rows[0]);
  const { rows: respuestas } = await pool.query(
    `SELECT r.*, u.nombre || ' ' || u.apellido AS autor
     FROM respuestas_ticket r JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.ticket_id = $1 ORDER BY r.created_at ASC`,
    [id]
  );
  return { ...ticket, respuestas };
};

const create = async ({ asunto, descripcion, categoria, prioridad }, usuario_id) => {
  const { rows } = await pool.query(
    'INSERT INTO tickets_soporte (usuario_id, asunto, descripcion, categoria, prioridad) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [usuario_id, asunto, descripcion, categoria || 'general', prioridad || 'media']
  );
  return getById(rows[0].id);
};

const responder = async (ticket_id, { contenido, es_interna = false }, usuario_id) => {
  await pool.query(
    'INSERT INTO respuestas_ticket (ticket_id, usuario_id, contenido, es_interna) VALUES ($1,$2,$3,$4)',
    [ticket_id, usuario_id, contenido, es_interna]
  );
  await pool.query(
    "UPDATE tickets_soporte SET estado = 'en_proceso', updated_at = NOW() WHERE id = $1 AND estado = 'abierto'",
    [ticket_id]
  );
  return getById(ticket_id);
};

const cambiarEstado = async (id, estado, asignado_a = null) => {
  const resuelto_en = estado === 'resuelto' ? 'NOW()' : 'NULL';
  await pool.query(
    `UPDATE tickets_soporte SET estado = $1, asignado_a = $2, resuelto_en = ${resuelto_en}, updated_at = NOW() WHERE id = $3`,
    [estado, asignado_a, id]
  );
  return getById(id);
};

module.exports = { getMios, getAll, getById, create, responder, cambiarEstado };
