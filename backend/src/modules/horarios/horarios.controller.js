const svc = require('./horarios.service');

const getMio = async (req, res, next) => {
  try {
    const { role, id } = req.user;
    let data;
    if (role === 'docente') data = await svc.getByDocente(id);
    else if (role === 'estudiante') data = await svc.getByEstudiante(id);
    else data = [];
    res.json(data);
  } catch (e) { next(e); }
};

const getByCurso = async (req, res, next) => {
  try { res.json(await svc.getByCurso(req.params.cursoId)); }
  catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.body)); }
  catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { res.json(await svc.update(req.params.id, req.body)); }
  catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { res.json(await svc.remove(req.params.id)); }
  catch (e) { next(e); }
};

module.exports = { getMio, getByCurso, create, update, remove };
