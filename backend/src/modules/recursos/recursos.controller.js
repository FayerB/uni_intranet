const svc = require('./recursos.service');

const getAll           = async (req, res, next) => {
  try { res.json(await svc.getAll(req.query)); } catch (e) { next(e); }
};
const getById          = async (req, res, next) => {
  try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
};
const create           = async (req, res, next) => {
  try { res.status(201).json(await svc.create(req.body, req.user.id)); } catch (e) { next(e); }
};
const descargar        = async (req, res, next) => {
  try {
    await svc.registrarDescarga(req.params.id);
    const recurso = await svc.getById(req.params.id);
    res.json({ url: recurso.url });
  } catch (e) { next(e); }
};
const remove           = async (req, res, next) => {
  try { res.json(await svc.remove(req.params.id)); } catch (e) { next(e); }
};
const getCategorias    = async (req, res, next) => {
  try { res.json(await svc.getCategorias()); } catch (e) { next(e); }
};
const createCategoria  = async (req, res, next) => {
  try { res.status(201).json(await svc.createCategoria(req.body)); } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, descargar, remove, getCategorias, createCategoria };
