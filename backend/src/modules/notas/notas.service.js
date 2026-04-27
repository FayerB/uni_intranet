const pool = require('../../config/db');

const format = (row) => ({
  estudianteId: row.estudiante_id,
  name:         `${row.apellido}, ${row.nombre}`,
  notaId:       row.nota_id || null,
  p1:           parseFloat(row.p1 ?? 0),
  p2:           parseFloat(row.p2 ?? 0),
  ep:           parseFloat(row.ep ?? 0),
  ef:           parseFloat(row.ef ?? 0),
  promedio:     parseFloat(row.promedio ?? 0),
  estado:       row.estado || 'desaprobado',
});

const getByCourse = async (cursoId, userId, showAll) => {
  let query = `
    SELECT u.id AS estudiante_id, u.nombre, u.apellido,
      n.id AS nota_id, n.p1, n.p2, n.ep, n.ef, n.promedio, n.estado
    FROM matriculas m
    JOIN  usuarios u ON u.id = m.estudiante_id
    LEFT JOIN notas n ON n.estudiante_id = m.estudiante_id AND n.curso_id = m.curso_id
    WHERE m.curso_id = $1
  `;
  const params = [cursoId];

  if (!showAll) {
    query += ' AND m.estudiante_id = $2';
    params.push(userId);
  }

  query += ' ORDER BY u.apellido, u.nombre';
  const { rows } = await pool.query(query, params);
  return rows.map(format);
};

const calcPromedio = (p1, p2, ep, ef) =>
  Math.round((p1 * 0.15) + (p2 * 0.15) + (ep * 0.30) + (ef * 0.40));

const upsertMany = async (cursoId, grades) => {
  const results = [];
  for (const g of grades) {
    const p1 = g.p1 || 0, p2 = g.p2 || 0, ep = g.ep || 0, ef = g.ef || 0;
    const promedio = calcPromedio(p1, p2, ep, ef);
    const estado   = promedio >= 11 ? 'aprobado' : 'desaprobado';

    const { rows } = await pool.query(
      `INSERT INTO notas (estudiante_id, curso_id, p1, p2, ep, ef, promedio, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (estudiante_id, curso_id)
       DO UPDATE SET p1=$3, p2=$4, ep=$5, ef=$6, promedio=$7, estado=$8, updated_at=NOW()
       RETURNING id`,
      [g.estudianteId, cursoId, p1, p2, ep, ef, promedio, estado]
    );
    results.push({ estudianteId: g.estudianteId, success: true, id: rows[0].id });
  }
  return results;
};

module.exports = { getByCourse, upsertMany };
