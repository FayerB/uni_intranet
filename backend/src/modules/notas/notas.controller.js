const notasService = require('./notas.service');

const getByCourse = async (req, res) => {
  const { curso_id } = req.query;
  if (!curso_id) return res.status(400).json({ message: 'Se requiere curso_id' });

  const showAll = req.user.role !== 'estudiante';
  try {
    res.json(await notasService.getByCourse(curso_id, req.user.id, showAll));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const upsertMany = async (req, res) => {
  const { curso_id, grades } = req.body;
  if (!curso_id || !Array.isArray(grades) || grades.length === 0) {
    return res.status(400).json({ message: 'curso_id y grades[] son requeridos' });
  }
  try {
    const results = await notasService.upsertMany(curso_id, grades);
    res.json({ saved: results.length, results });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getHistorial = async (req, res) => {
  try {
    // Sin param → usa el usuario logueado (cualquier rol puede ver su propio historial)
    const id = req.params.estudianteId || req.user.id;
    res.json(await notasService.getHistorial(id));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { getByCourse, upsertMany, getHistorial };
