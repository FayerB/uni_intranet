const pool = require('../../config/db');

const format = (row) => ({
  estudianteId: row.estudiante_id,
  name:         `${row.apellido}, ${row.nombre}`,
  asistenciaId: row.asistencia_id || null,
  estado:       row.estado || null,
});

const getForDate = async (cursoId, fecha, userId, showAll) => {
  let query = `
    SELECT u.id AS estudiante_id, u.nombre, u.apellido,
      a.id AS asistencia_id, a.estado
    FROM matriculas m
    JOIN  usuarios u ON u.id = m.estudiante_id
    LEFT JOIN asistencias a
      ON a.estudiante_id = m.estudiante_id AND a.curso_id = m.curso_id AND a.fecha = $2
    WHERE m.curso_id = $1
  `;
  const params = [cursoId, fecha];

  if (!showAll) {
    query += ' AND m.estudiante_id = $3';
    params.push(userId);
  }

  query += ' ORDER BY u.apellido, u.nombre';
  const { rows } = await pool.query(query, params);
  return rows.map(format);
};

const upsertMany = async (cursoId, fecha, records) => {
  const results = [];
  for (const r of records) {
    const { rows } = await pool.query(
      `INSERT INTO asistencias (estudiante_id, curso_id, fecha, estado)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (estudiante_id, curso_id, fecha)
       DO UPDATE SET estado=$4, updated_at=NOW()
       RETURNING id`,
      [r.estudianteId, cursoId, fecha, r.estado]
    );
    results.push({ estudianteId: r.estudianteId, success: true, id: rows[0].id });
  }
  return results;
};

module.exports = { getForDate, upsertMany };
