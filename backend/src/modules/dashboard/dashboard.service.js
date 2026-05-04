const pool = require('../../config/db');

const getAdminStats = async () => {
  const [totalesRes, porRolRes, porCategoriaRes, chartRes] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM usuarios WHERE activo = true)    AS "totalUsuarios",
        (SELECT COUNT(*) FROM noticias)                        AS "totalNoticias",
        (SELECT COUNT(*) FROM noticias WHERE publicado = true) AS "noticiasPublicadas",
        (SELECT COUNT(*) FROM cursos   WHERE activo = true)    AS "totalCursos",
        (SELECT COUNT(*) FROM matriculas)                      AS "totalMatriculas"
    `),
    pool.query(`
      SELECT rol, COUNT(*)::int AS cantidad
      FROM usuarios WHERE activo = true
      GROUP BY rol ORDER BY rol
    `),
    pool.query(`
      SELECT categoria, COUNT(*)::int AS cantidad
      FROM noticias WHERE publicado = true
      GROUP BY categoria ORDER BY cantidad DESC
    `),
    pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', mes), 'Mon') AS name,
        COALESCE(n.noticias, 0) AS noticias,
        COALESCE(u.usuarios, 0) AS usuarios
      FROM generate_series(
        DATE_TRUNC('month', NOW() - INTERVAL '5 months'),
        DATE_TRUNC('month', NOW()),
        '1 month'
      ) AS mes
      LEFT JOIN (
        SELECT DATE_TRUNC('month', created_at) AS m, COUNT(*)::int AS noticias
        FROM noticias GROUP BY m
      ) n ON n.m = mes
      LEFT JOIN (
        SELECT DATE_TRUNC('month', created_at) AS m, COUNT(*)::int AS usuarios
        FROM usuarios GROUP BY m
      ) u ON u.m = mes
      ORDER BY mes
    `),
  ]);

  const t = totalesRes.rows[0];
  return {
    role: 'admin',
    totalUsuarios:        parseInt(t.totalUsuarios),
    totalNoticias:        parseInt(t.totalNoticias),
    noticiasPublicadas:   parseInt(t.noticiasPublicadas),
    totalCursos:          parseInt(t.totalCursos),
    totalMatriculas:      parseInt(t.totalMatriculas),
    usuariosPorRol:       porRolRes.rows,
    noticiasPorCategoria: porCategoriaRes.rows,
    chartData:            chartRes.rows,
  };
};

const getDocenteStats = async (userId) => {
  const [cursosRes, estudiantesRes, tareasRes, asistenciaRes] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total FROM cursos WHERE docente_id = $1 AND activo = true`,
      [userId]
    ),
    pool.query(
      `SELECT COUNT(DISTINCT m.estudiante_id)::int AS total
       FROM matriculas m JOIN cursos c ON c.id = m.curso_id
       WHERE c.docente_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total FROM tareas WHERE docente_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE estado = 'presente')::int AS presentes,
         COUNT(*)::int AS total
       FROM asistencias a
       JOIN cursos c ON c.id = a.curso_id
       WHERE c.docente_id = $1`,
      [userId]
    ),
  ]);

  const att = asistenciaRes.rows[0];
  const tasaAsistencia = att.total > 0
    ? Math.round((att.presentes / att.total) * 100)
    : 0;

  return {
    role: 'docente',
    misCursos:       cursosRes.rows[0].total,
    misEstudiantes:  estudiantesRes.rows[0].total,
    misTareas:       tareasRes.rows[0].total,
    tasaAsistencia,
  };
};

const getEstudianteStats = async (userId) => {
  const [cursosRes, notasRes, asistenciaRes, tareasRes] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total FROM matriculas WHERE estudiante_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT
         ROUND(AVG((n.p1*0.15 + n.p2*0.15 + n.ep*0.3 + n.ef*0.4))::numeric, 1) AS promedio
       FROM notas n
       JOIN matriculas m ON m.curso_id = n.curso_id AND m.estudiante_id = n.estudiante_id
       WHERE n.estudiante_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE estado = 'presente')::int AS presentes,
         COUNT(*)::int AS total
       FROM asistencias WHERE estudiante_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS pendientes
       FROM tareas t
       JOIN matriculas m ON m.curso_id = t.curso_id
       WHERE m.estudiante_id = $1
         AND t.fecha_entrega >= NOW()`,
      [userId]
    ),
  ]);

  const att = asistenciaRes.rows[0];
  const tasaAsistencia = att.total > 0
    ? Math.round((att.presentes / att.total) * 100)
    : 0;

  return {
    role: 'estudiante',
    cursosMeInscritos: cursosRes.rows[0].total,
    promedioGeneral:   parseFloat(notasRes.rows[0].promedio) || 0,
    tasaAsistencia,
    tareasPendientes:  tareasRes.rows[0].pendientes,
  };
};

const getStats = async (role, userId) => {
  if (role === 'admin')      return getAdminStats();
  if (role === 'docente')    return getDocenteStats(userId);
  return getEstudianteStats(userId);
};

module.exports = { getStats };
