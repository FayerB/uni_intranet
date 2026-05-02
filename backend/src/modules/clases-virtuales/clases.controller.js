const svc = require('./clases.service');

const TABLE_MISSING = '42P01';

const getAll      = async (req, res, next) => {
  try { res.json(await svc.getAll(req.user.id, req.user.role)); }
  catch (e) { if (e.code === TABLE_MISSING) return res.json([]); next(e); }
};
const getByCurso  = async (req, res, next) => {
  try { res.json(await svc.getByCurso(req.params.cursoId)); }
  catch (e) { if (e.code === TABLE_MISSING) return res.json([]); next(e); }
};
const getProximas = async (req, res, next) => {
  try { res.json(await svc.getProximas(req.user.id, req.user.role)); }
  catch (e) { if (e.code === TABLE_MISSING) return res.json([]); next(e); }
};
const getById     = async (req, res, next) => {
  try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
};
const create      = async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.body, req.user.id)); } catch (e) { next(e); }
};
const update      = async (req, res, next) => {
  try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
};
const remove      = async (req, res, next) => {
  try { res.json(await svc.remove(req.params.id)); } catch (e) { next(e); }
};

module.exports = { getAll, getByCurso, getProximas, getById, create, update, remove };
