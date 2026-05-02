/**
 * Construye cláusulas LIMIT/OFFSET a partir de query params.
 * Retorna { limit, offset, page } y una función meta(total) para la respuesta.
 */
const paginate = (query) => {
  const page  = Math.max(1, parseInt(query.page  || 1,  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
  const offset = (page - 1) * limit;

  const meta = (total) => ({
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  });

  return { limit, offset, page, meta };
};

module.exports = { paginate };
