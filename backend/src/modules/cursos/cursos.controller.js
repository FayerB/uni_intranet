const cursosService = require('./cursos.service');

const getAll = async (req, res) => {
  try {
    res.json(await cursosService.getAll(req.query));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getById = async (req, res) => {
  try {
    res.json(await cursosService.getById(req.params.id));
  } catch (e) { res.status(404).json({ message: e.message }); }
};

const create = async (req, res) => {
  const { codigo, nombre } = req.body;
  if (!codigo || !nombre) {
    return res.status(400).json({ message: 'codigo y nombre son requeridos' });
  }
  try {
    const docente_id = req.user.role === 'docente' ? req.user.id : (req.body.docente_id || null);
    res.status(201).json(await cursosService.create({ ...req.body, docente_id }));
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'El código ya existe' });
    res.status(500).json({ message: e.message });
  }
};

const update = async (req, res) => {
  try {
    res.json(await cursosService.update(req.params.id, req.body));
  } catch (e) {
    res.status(e.message === 'Curso no encontrado' ? 404 : 400).json({ message: e.message });
  }
};

const remove = async (req, res) => {
  try {
    res.json(await cursosService.remove(req.params.id));
  } catch (e) { res.status(404).json({ message: e.message }); }
};

module.exports = { getAll, getById, create, update, remove };
