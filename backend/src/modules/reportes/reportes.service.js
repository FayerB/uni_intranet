const pool = require('../../config/db');

const getUsuarios = async () => {
  const { rows } = await pool.query(`
    SELECT rol,
      COUNT(*)::int                                    AS total,
      COUNT(*) FILTER (WHERE activo = true)::int       AS activos,
      COUNT(*) FILTER (WHERE activo = false)::int      AS inactivos
    FROM usuarios
    GROUP BY rol ORDER BY rol
  `);
  return rows;
};

const getNoticias = async () => {
  const { rows } = await pool.query(`
    SELECT categoria,
      COUNT(*)::int                                       AS total,
      COUNT(*) FILTER (WHERE publicado = true)::int       AS publicadas,
      COUNT(*) FILTER (WHERE publicado = false)::int      AS ocultas
    FROM noticias
    GROUP BY categoria ORDER BY total DESC
  `);
  return rows;
};

const getCursos = async () => {
  const { rows } = await pool.query(`
    SELECT c.tipo,
      COUNT(*)::int                                    AS total,
      COUNT(*) FILTER (WHERE c.activo = true)::int     AS activos,
      COALESCE(SUM(sub.matriculados), 0)::int          AS total_matriculados
    FROM cursos c
    LEFT JOIN (
      SELECT curso_id, COUNT(*)::int AS matriculados
      FROM matriculas GROUP BY curso_id
    ) sub ON sub.curso_id = c.id
    GROUP BY c.tipo ORDER BY total DESC
  `);
  return rows;
};

const getMatriculas = async () => {
  const { rows } = await pool.query(`
    SELECT estado, COUNT(*)::int AS total
    FROM matriculas
    GROUP BY estado ORDER BY total DESC
  `);
  return rows;
};

const getNotas = async () => {
  const { rows } = await pool.query(`
    SELECT estado,
      COUNT(*)::int                       AS total,
      ROUND(AVG(promedio), 1)::numeric    AS promedio_nota
    FROM notas
    GROUP BY estado ORDER BY estado
  `);
  return rows;
};

const getAsistencia = async () => {
  const { rows } = await pool.query(`
    SELECT estado, COUNT(*)::int AS total
    FROM asistencias
    GROUP BY estado ORDER BY total DESC
  `);
  return rows;
};

const getTareas = async () => {
  const { rows } = await pool.query(`
    SELECT estado, COUNT(*)::int AS total
    FROM entregas
    GROUP BY estado ORDER BY total DESC
  `);
  return rows;
};

const getPagos = async () => {
  const { rows } = await pool.query(`
    SELECT estado,
      COUNT(*)::int           AS total,
      SUM(monto)::numeric     AS monto_total
    FROM pagos
    GROUP BY estado ORDER BY estado
  `);
  return rows;
};

const getSoporte = async () => {
  const { rows } = await pool.query(`
    SELECT estado,
      COUNT(*)::int                                              AS total,
      COUNT(*) FILTER (WHERE prioridad = 'urgente')::int        AS urgentes,
      COUNT(*) FILTER (WHERE prioridad = 'alta')::int           AS alta_prioridad
    FROM tickets_soporte
    GROUP BY estado ORDER BY total DESC
  `);
  return rows;
};

const getResumen = async () => {
  const [usuarios, noticias, cursos, matriculas, notas, asistencia, tareas, pagos, soporte] =
    await Promise.all([
      getUsuarios(), getNoticias(), getCursos(), getMatriculas(),
      getNotas(), getAsistencia(), getTareas(), getPagos(), getSoporte(),
    ]);
  return { usuarios, noticias, cursos, matriculas, notas, asistencia, tareas, pagos, soporte };
};

module.exports = { getUsuarios, getNoticias, getCursos, getMatriculas, getNotas, getAsistencia, getTareas, getPagos, getSoporte, getResumen };
