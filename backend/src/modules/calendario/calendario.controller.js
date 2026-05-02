const svc = require('./calendario.service');

const getEventos = async (req, res, next) => {
  try {
    const opts = { ...req.query, usuario_id: req.user.id, rol: req.user.role };
    res.json(await svc.getEventos(opts));
  } catch (e) { next(e); }
};
const getById = async (req, res, next) => {
  try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
};
const create  = async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.body, req.user.id)); } catch (e) { next(e); }
};
const update  = async (req, res, next) => {
  try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
};
const remove  = async (req, res, next) => {
  try { res.json(await svc.remove(req.params.id)); } catch (e) { next(e); }
};

module.exports = { getEventos, getById, create, update, remove };
