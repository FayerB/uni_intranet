const svc = require('./examenes.service');

const getByCurso        = async (req, res, next) => {
  try { res.json(await svc.getByCurso(req.params.cursoId)); } catch (e) { next(e); }
};
const getById           = async (req, res, next) => {
  try {
    const incluir = ['admin', 'docente'].includes(req.user.role);
    res.json(await svc.getById(req.params.id, incluir));
  } catch (e) { next(e); }
};
const create            = async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.body, req.user.id)); } catch (e) { next(e); }
};
const update            = async (req, res, next) => {
  try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
};
const remove            = async (req, res, next) => {
  try { res.json(await svc.remove(req.params.id)); } catch (e) { next(e); }
};

// Preguntas
const addPregunta       = async (req, res, next) => {
  try { res.status(201).json(await svc.addPregunta(req.params.id, req.body)); } catch (e) { next(e); }
};
const removePregunta    = async (req, res, next) => {
  try { res.json(await svc.removePregunta(req.params.preguntaId)); } catch (e) { next(e); }
};

// Rendición
const iniciarIntento    = async (req, res, next) => {
  try { res.status(201).json(await svc.iniciarIntento(req.params.id, req.user.id)); } catch (e) { next(e); }
};
const guardarRespuesta  = async (req, res, next) => {
  try {
    const { pregunta_id, opcion_id, respuesta_texto } = req.body;
    res.json(await svc.guardarRespuesta(req.params.intentoId, pregunta_id, { opcion_id, respuesta_texto }));
  } catch (e) { next(e); }
};
const finalizarIntento  = async (req, res, next) => {
  try { res.json(await svc.finalizarIntento(req.params.intentoId, req.user.id)); } catch (e) { next(e); }
};
const getResultados     = async (req, res, next) => {
  try { res.json(await svc.getResultadosByExamen(req.params.id)); } catch (e) { next(e); }
};

module.exports = {
  getByCurso, getById, create, update, remove,
  addPregunta, removePregunta,
  iniciarIntento, guardarRespuesta, finalizarIntento, getResultados,
};
