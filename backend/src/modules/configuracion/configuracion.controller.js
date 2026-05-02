const svc = require('./configuracion.service');

const getAll          = async (req, res, next) => {
  try { res.json(await svc.getAll(req.query.categoria)); } catch (e) { next(e); }
};
const set             = async (req, res, next) => {
  try {
    const { clave, valor } = req.body;
    if (!clave || valor === undefined) return res.status(400).json({ message: 'clave y valor requeridos' });
    res.json(await svc.set(clave, String(valor)));
  } catch (e) { next(e); }
};
const setBulk         = async (req, res, next) => {
  try { res.json(await svc.setBulk(req.body)); } catch (e) { next(e); }
};
const getPeriodos     = async (req, res, next) => {
  try { res.json(await svc.getPeriodos()); } catch (e) { next(e); }
};
const createPeriodo   = async (req, res, next) => {
  try { res.status(201).json(await svc.createPeriodo(req.body)); } catch (e) { next(e); }
};
const setPeriodoActivo = async (req, res, next) => {
  try { res.json(await svc.setPeriodoActivo(req.params.id)); } catch (e) { next(e); }
};

module.exports = { getAll, set, setBulk, getPeriodos, createPeriodo, setPeriodoActivo };
