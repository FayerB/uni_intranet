const svc = require('./tareas.service');

// ─── Tareas ───────────────────────────────────────────────────────────────────

const getMias = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let data;
    if (role === 'estudiante') data = await svc.getByEstudiante(id);
    else if (req.query.curso_id) data = await svc.getByCurso(req.query.curso_id);
    else data = [];
    res.json(data);
  } catch (e) { next(e); }
};

const getByCurso = async (req, res, next) => {
  try { res.json(await svc.getByCurso(req.params.cursoId)); } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.body, req.user.id)); } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { res.json(await svc.remove(req.params.id)); } catch (e) { next(e); }
};

// ─── Entregas ─────────────────────────────────────────────────────────────────

const getEntregas = async (req, res, next) => {
  try { res.json(await svc.getEntregasByTarea(req.params.id)); } catch (e) { next(e); }
};

const getMiEntrega = async (req, res, next) => {
  try {
    const entrega = await svc.getEntregaByEstudiante(req.params.id, req.user.id);
    res.json(entrega || { estado: 'pendiente' });
  } catch (e) { next(e); }
};

const entregar = async (req, res, next) => {
  try {
    res.status(201).json(await svc.entregar(req.params.id, req.user.id, req.body));
  } catch (e) { next(e); }
};

const calificar = async (req, res, next) => {
  try {
    const { calificacion, comentario_docente } = req.body;
    if (calificacion === undefined) return res.status(400).json({ message: 'calificacion es requerida' });
    res.json(await svc.calificar(req.params.entregaId, req.user.id, { calificacion, comentario_docente }));
  } catch (e) { next(e); }
};

module.exports = { getMias, getByCurso, getById, create, update, remove, getEntregas, getMiEntrega, entregar, calificar };
