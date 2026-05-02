const svc = require('./soporte.service');

const getMios        = async (req, res, next) => {
  try { res.json(await svc.getMios(req.user.id)); } catch (e) { next(e); }
};
const getAll         = async (req, res, next) => {
  try { res.json(await svc.getAll(req.query)); } catch (e) { next(e); }
};
const getById        = async (req, res, next) => {
  try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
};
const create         = async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.body, req.user.id)); } catch (e) { next(e); }
};
const responder      = async (req, res, next) => {
  try { res.json(await svc.responder(req.params.id, req.body, req.user.id)); } catch (e) { next(e); }
};
const cambiarEstado  = async (req, res, next) => {
  try {
    const { estado, asignado_a } = req.body;
    if (!estado) return res.status(400).json({ message: 'estado requerido' });
    res.json(await svc.cambiarEstado(req.params.id, estado, asignado_a));
  } catch (e) { next(e); }
};

module.exports = { getMios, getAll, getById, create, responder, cambiarEstado };
