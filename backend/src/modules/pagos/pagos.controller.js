const svc = require('./pagos.service');

const getMios         = async (req, res, next) => {
  try { res.json(await svc.getByEstudiante(req.user.id)); } catch (e) { next(e); }
};
const getByEstudiante = async (req, res, next) => {
  try { res.json(await svc.getByEstudiante(req.params.estudianteId)); } catch (e) { next(e); }
};
const getAll          = async (req, res, next) => {
  try { res.json(await svc.getAll(req.query)); } catch (e) { next(e); }
};
const create          = async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.body)); } catch (e) { next(e); }
};
const registrar       = async (req, res, next) => {
  try { res.json(await svc.registrarPago(req.params.id, req.body, req.user.id)); } catch (e) { next(e); }
};
const getConceptos    = async (req, res, next) => {
  try { res.json(await svc.getConceptos()); } catch (e) { next(e); }
};
const createConcepto  = async (req, res, next) => {
  try { res.status(201).json(await svc.createConcepto(req.body)); } catch (e) { next(e); }
};

module.exports = { getMios, getByEstudiante, getAll, create, registrar, getConceptos, createConcepto };
