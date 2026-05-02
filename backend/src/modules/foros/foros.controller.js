const svc = require('./foros.service');

const getForosByCurso = async (req, res, next) => {
  try { res.json(await svc.getForosByCurso(req.params.cursoId)); } catch (e) { next(e); }
};
const createForo      = async (req, res, next) => {
  try { res.status(201).json(await svc.createForo(req.body, req.user.id)); } catch (e) { next(e); }
};
const getHilos        = async (req, res, next) => {
  try { res.json(await svc.getHilosByForo(req.params.foroId)); } catch (e) { next(e); }
};
const getHilo         = async (req, res, next) => {
  try { res.json(await svc.getHiloById(req.params.hiloId)); } catch (e) { next(e); }
};
const createHilo      = async (req, res, next) => {
  try { res.status(201).json(await svc.createHilo(req.params.foroId, req.body, req.user.id)); } catch (e) { next(e); }
};
const responder       = async (req, res, next) => {
  try { res.status(201).json(await svc.responderHilo(req.params.hiloId, req.body, req.user.id)); } catch (e) { next(e); }
};
const toggleFijado    = async (req, res, next) => {
  try { res.json(await svc.toggleFijado(req.params.hiloId)); } catch (e) { next(e); }
};

module.exports = { getForosByCurso, createForo, getHilos, getHilo, createHilo, responder, toggleFijado };
