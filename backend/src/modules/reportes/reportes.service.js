const pool = require('../../config/db');

const getUsuarios = async () => {
  const { rows } = await pool.query(`
    SELECT
      rol,
      COUNT(*)::int                                       AS total,
      COUNT(*) FILTER (WHERE activo = true)::int          AS activos,
      COUNT(*) FILTER (WHERE activo = false)::int         AS inactivos
    FROM usuarios
    GROUP BY rol
    ORDER BY rol
  `);
  return rows;
};

const getNoticias = async () => {
  const { rows } = await pool.query(`
    SELECT
      categoria,
      COUNT(*)::int                                          AS total,
      COUNT(*) FILTER (WHERE publicado = true)::int          AS publicadas,
      COUNT(*) FILTER (WHERE publicado = false)::int         AS ocultas
    FROM noticias
    GROUP BY categoria
    ORDER BY total DESC
  `);
  return rows;
};

const getResumen = async () => {
  const [usuarios, noticias] = await Promise.all([getUsuarios(), getNoticias()]);
  return { usuarios, noticias };
};

module.exports = { getUsuarios, getNoticias, getResumen };
