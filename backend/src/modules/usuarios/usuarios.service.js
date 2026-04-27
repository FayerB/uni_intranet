const bcrypt = require('bcrypt');
const pool = require('../../config/db');

const format = (u) => ({
  id: u.id,
  name: `${u.nombre} ${u.apellido}`,
  nombre: u.nombre,
  apellido: u.apellido,
  email: u.email,
  role: u.rol,
  status: u.activo ? 'Activo' : 'Inactivo',
  initial: u.nombre.charAt(0).toUpperCase(),
});

const getAll = async ({ search, role } = {}) => {
  let query = `
    SELECT id, nombre, apellido, email, rol, activo
    FROM usuarios
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    const i = params.length;
    query += ` AND (nombre ILIKE $${i} OR apellido ILIKE $${i} OR email ILIKE $${i})`;
  }

  if (role && role !== 'Todos') {
    params.push(role.toLowerCase());
    query += ` AND rol = $${params.length}`;
  }

  query += ' ORDER BY nombre ASC';

  const { rows } = await pool.query(query, params);
  return rows.map(format);
};

const getById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, nombre, apellido, email, rol, activo FROM usuarios WHERE id = $1',
    [id]
  );
  if (!rows[0]) throw new Error('Usuario no encontrado');
  return format(rows[0]);
};

const create = async ({ nombre, apellido, email, password, rol = 'estudiante' }) => {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, apellido, email, password, rol)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, apellido, email, rol, activo`,
    [nombre, apellido, email, hash, rol.toLowerCase()]
  );
  return format(rows[0]);
};

const update = async (id, data) => {
  const allowed = ['nombre', 'apellido', 'email', 'rol', 'activo'];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      params.push(key === 'rol' ? data[key].toLowerCase() : data[key]);
      fields.push(`${key} = $${params.length}`);
    }
  }

  if (!fields.length) throw new Error('Nada que actualizar');

  params.push(id);
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING id, nombre, apellido, email, rol, activo`,
    params
  );

  if (!rows[0]) throw new Error('Usuario no encontrado');
  return format(rows[0]);
};

const remove = async (id) => {
  const { rows } = await pool.query(
    `UPDATE usuarios SET activo = false, updated_at = NOW()
     WHERE id = $1 RETURNING id`,
    [id]
  );
  if (!rows[0]) throw new Error('Usuario no encontrado');
  return { message: 'Usuario desactivado correctamente' };
};

module.exports = { getAll, getById, create, update, remove };
