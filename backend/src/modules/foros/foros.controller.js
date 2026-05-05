const svc = require('./foros.service');
const { ApiError } = require('../../utils/apiError');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validUUID = (id) => UUID_RE.test(id);

const getForosByCurso = async (req, res, next) => {
  try { res.json(await svc.getForosByCurso(req.params.cursoId)); } catch (e) { next(e); }
};
const createForo      = async (req, res, next) => {
  try { res.status(201).json(await svc.createForo(req.body, req.user.id)); } catch (e) { next(e); }
};
const getHilos        = async (req, res, next) => {
  if (!validUUID(req.params.foroId)) return next(ApiError.notFound('Foro no encontrado'));
  try { res.json(await svc.getHilosByForo(req.params.foroId)); } catch (e) { next(e); }
};
const getHilo         = async (req, res, next) => {
  if (!validUUID(req.params.hiloId)) return next(ApiError.notFound('Hilo no encontrado'));
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
