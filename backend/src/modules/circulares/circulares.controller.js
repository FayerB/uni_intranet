const service = require('./circulares.service');

const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.user.id, req.user.role);
    res.json(data);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const circular = await service.create(req.body, req.user.id);
    res.status(201).json(circular);
  } catch (e) { next(e); }
};

const marcarLeida = async (req, res, next) => {
  try {
    await service.marcarLeida(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id, req.user.id, req.user.role);
    res.json({ ok: true });
  } catch (e) { next(e); }
};

module.exports = { getAll, create, marcarLeida, remove };
