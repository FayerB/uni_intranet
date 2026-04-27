const pool = require('../../config/db');

const getStats = async () => {
  const [
    totalesRes,
    porRolRes,
    porCategoriaRes,
    publicadasRes,
    chartRes,
  ] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*) FROM usuarios WHERE activo = true)   AS "totalUsuarios",
        (SELECT COUNT(*) FROM noticias)                       AS "totalNoticias",
        (SELECT COUNT(*) FROM noticias WHERE publicado = true)  AS "noticiasPublicadas",
        (SELECT COUNT(*) FROM noticias WHERE publicado = false) AS "noticiasNoPublicadas"
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
    pool.query(`SELECT 1`), // placeholder — ya incluido en totalesRes
    pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', mes), 'Mon') AS name,
        COALESCE(n.noticias, 0)  AS noticias,
        COALESCE(u.usuarios, 0)  AS usuarios
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
    totalUsuarios:         parseInt(t.totalUsuarios),
    totalNoticias:         parseInt(t.totalNoticias),
    noticiasPublicadas:    parseInt(t.noticiasPublicadas),
    noticiasNoPublicadas:  parseInt(t.noticiasNoPublicadas),
    usuariosPorRol:        porRolRes.rows,
    noticiasPorCategoria:  porCategoriaRes.rows,
    chartData:             chartRes.rows,
  };
};

module.exports = { getStats };
