const svc = require('./notificaciones.service');

const getMias         = async (req, res, next) => {
  try {
    const opts = { solo_no_leidas: req.query.no_leidas === 'true', limit: req.query.limit };
    res.json(await svc.getByUsuario(req.user.id, opts));
  } catch (e) { next(e); }
};
const countNoLeidas   = async (req, res, next) => {
  try { res.json({ count: await svc.countNoLeidas(req.user.id) }); } catch (e) { next(e); }
};
const marcarLeida     = async (req, res, next) => {
  try { res.json(await svc.marcarLeida(req.params.id, req.user.id)); } catch (e) { next(e); }
};
const marcarTodas     = async (req, res, next) => {
  try { res.json(await svc.marcarTodasLeidas(req.user.id)); } catch (e) { next(e); }
};
const eliminar        = async (req, res, next) => {
  try { res.json(await svc.eliminar(req.params.id, req.user.id)); } catch (e) { next(e); }
};

module.exports = { getMias, countNoLeidas, marcarLeida, marcarTodas, eliminar };
