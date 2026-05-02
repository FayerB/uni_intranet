const pool = require('../../config/db');
const { paginate } = require('../../utils/pagination');

const getByEstudiante = async (estudiante_id) => {
  const { rows } = await pool.query(
    `SELECT p.*, cp.nombre AS concepto, cp.descripcion AS concepto_desc
     FROM pagos p JOIN conceptos_pago cp ON cp.id = p.concepto_id
     WHERE p.estudiante_id = $1 ORDER BY p.fecha_vencimiento DESC`,
    [estudiante_id]
  );
  return rows;
};

const getAll = async ({ estado, page, limit } = {}) => {
  const { limit: lim, offset, meta } = paginate({ page, limit });
  let where = 'WHERE 1=1';
  const params = [];
  if (estado) { params.push(estado); where += ` AND p.estado = $${params.length}`; }

  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*)::int FROM pagos p ${where}`, params
  );
  params.push(lim, offset);
  const { rows } = await pool.query(
    `SELECT p.*, cp.nombre AS concepto,
       u.nombre || ' ' || u.apellido AS estudiante_nombre, u.email
     FROM pagos p
     JOIN conceptos_pago cp ON cp.id = p.concepto_id
     JOIN usuarios u ON u.id = p.estudiante_id
     ${where}
     ORDER BY p.fecha_vencimiento ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return { data: rows, meta: meta(count) };
};

const registrarPago = async (id, { fecha_pago, referencia, comprobante_url }, registrado_por) => {
  const { rows } = await pool.query(
    `UPDATE pagos SET estado = 'pagado', fecha_pago = $1, referencia = $2,
       comprobante_url = $3, registrado_por = $4, updated_at = NOW()
     WHERE id = $5 RETURNING *`,
    [fecha_pago || new Date(), referencia || null, comprobante_url || null, registrado_por, id]
  );
  if (!rows[0]) throw new Error('Pago no encontrado');
  return rows[0];
};

const create = async ({ estudiante_id, concepto_id, monto, fecha_vencimiento }) => {
  const { rows } = await pool.query(
    'INSERT INTO pagos (estudiante_id, concepto_id, monto, fecha_vencimiento) VALUES ($1,$2,$3,$4) RETURNING *',
    [estudiante_id, concepto_id, monto, fecha_vencimiento]
  );
  return rows[0];
};

/** Vencer pagos con fecha pasada automáticamente */
const actualizarVencidos = async () => {
  const { rowCount } = await pool.query(
    `UPDATE pagos SET estado = 'vencido'
     WHERE estado = 'pendiente' AND fecha_vencimiento < CURRENT_DATE`
  );
  return rowCount;
};

const getConceptos = async () => {
  const { rows } = await pool.query("SELECT * FROM conceptos_pago WHERE activo = true ORDER BY nombre");
  return rows;
};

const createConcepto = async ({ nombre, descripcion, monto }) => {
  const { rows } = await pool.query(
    'INSERT INTO conceptos_pago (nombre, descripcion, monto) VALUES ($1,$2,$3) RETURNING *',
    [nombre, descripcion || null, monto]
  );
  return rows[0];
};

module.exports = { getByEstudiante, getAll, registrarPago, create, actualizarVencidos, getConceptos, createConcepto };
