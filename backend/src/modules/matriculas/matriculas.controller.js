const matriculasService = require('./matriculas.service');

const getAll = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    res.json(await matriculasService.getAll(req.user.id, isAdmin));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const enroll = async (req, res) => {
  const { curso_ids, estudiante_id } = req.body;

  if (!Array.isArray(curso_ids) || curso_ids.length === 0) {
    return res.status(400).json({ message: 'curso_ids debe ser un arreglo no vacío' });
  }

  const targetId = (req.user.role === 'admin' && estudiante_id)
    ? estudiante_id
    : req.user.id;

  try {
    const results = await matriculasService.enrollMany(curso_ids, targetId);
    const enrolled = results.filter((r) => r.success).length;
    res.status(201).json({ enrolled, results });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const remove = async (req, res) => {
  try {
    res.json(await matriculasService.remove(req.params.id));
  } catch (e) { res.status(404).json({ message: e.message }); }
};

module.exports = { getAll, enroll, remove };
