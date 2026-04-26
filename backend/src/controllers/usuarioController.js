const pool = require('../config/db');

// Obtener todos los usuarios (Directorio de empleados)
const getUsuarios = async (req, res) => {
  try {
    // No devolvemos la contraseña por seguridad
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, rol, activo FROM usuarios ORDER BY nombre ASC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un solo usuario por su ID
const getUsuarioById = async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un UUID válido
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ message: 'ID de usuario no válido' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, email, rol, activo FROM usuarios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar (Desactivar) un usuario
const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un UUID válido para evitar errores de PostgreSQL
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ message: 'ID de usuario no válido' });
  }

  try {
    const result = await pool.query(
      'UPDATE usuarios SET activo = false WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: error.message }); // 👈 Ahora devolverá el error real
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, rol, activo } = req.body;

  // Validar que se envíen los campos obligatorios
  if (!nombre || !apellido || !email) {
    return res.status(400).json({ message: 'Los campos nombre, apellido y email son obligatorios' });
  }

  // Convertir el rol a minúsculas para cumplir con la regla de la base de datos
  const rolNormalizado = rol ? String(rol).toLowerCase() : 'empleado';

  // Validar que el ID sea un UUID válido
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ message: 'ID de usuario no válido' });
  }

  try {
    // Actualizamos los datos. Si "activo" no se envía, por defecto lo dejamos como está.
    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, apellido = $2, email = $3, rol = $4, activo = $5 WHERE id = $6 RETURNING id, nombre, apellido, email, rol, activo',
      [nombre, apellido, email, rolNormalizado, activo !== undefined ? activo : true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente', user: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    // Si intenta poner un correo que ya tiene otra persona
    if (error.code === '23505') {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado por otro usuario' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsuarios, getUsuarioById, deleteUsuario, updateUsuario };