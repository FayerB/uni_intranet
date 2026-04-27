const pool = require('../../config/db');

const BASE_SELECT = `
  SELECT m.id, m.estado, m.created_at,
    m.estudiante_id,
    ue.nombre AS est_nombre, ue.apellido AS est_apellido,
    m.curso_id,
    c.nombre AS curso_nombre, c.codigo AS curso_codigo, c.creditos
  FROM matriculas m
  JOIN usuarios ue ON ue.id = m.estudiante_id
  JOIN cursos   c  ON c.id  = m.curso_id
`;

const format = (m) => ({
  id:               m.id,
  estudiante_id:    m.estudiante_id,
  estudiante:       `${m.est_nombre} ${m.est_apellido}`,
  curso_id:         m.curso_id,
  curso:            m.curso_nombre,
  codigo:           m.curso_codigo,
  creditos:         m.creditos,
  estado:           m.estado,
  created_at:       m.created_at,
});

const getAll = async (userId, isAdmin) => {
  const query = isAdmin
    ? BASE_SELECT + ' ORDER BY m.created_at DESC'
    : BASE_SELECT + ' WHERE m.estudiante_id = $1 ORDER BY m.created_at DESC';
  const params = isAdmin ? [] : [userId];
  const { rows } = await pool.query(query, params);
  return rows.map(format);
};

const getMisCursoIds = async (userId) => {
  const { rows } = await pool.query(
    'SELECT curso_id FROM matriculas WHERE estudiante_id = $1 AND estado = $2',
    [userId, 'activo']
  );
  return rows.map((r) => r.curso_id);
};

const enrollMany = async (curso_ids, estudiante_id) => {
  const results = [];
  for (const curso_id of curso_ids) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO matriculas (estudiante_id, curso_id)
         VALUES ($1, $2) RETURNING id`,
        [estudiante_id, curso_id]
      );
      results.push({ curso_id, success: true, id: rows[0].id });
    } catch (e) {
      // 23505 = unique violation (ya matriculado)
      results.push({ curso_id, success: false, reason: e.code === '23505' ? 'Ya matriculado' : e.message });
    }
  }
  return results;
};

const remove = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM matriculas WHERE id = $1 RETURNING id', [id]
  );
  if (!rows[0]) throw new Error('Matrícula no encontrada');
  return { message: 'Matrícula eliminada' };
};

module.exports = { getAll, getMisCursoIds, enrollMany, remove };
