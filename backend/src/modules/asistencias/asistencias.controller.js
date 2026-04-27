const asistenciasService = require('./asistencias.service');

const getForDate = async (req, res) => {
  const { curso_id, fecha } = req.query;
  if (!curso_id || !fecha) {
    return res.status(400).json({ message: 'Se requieren curso_id y fecha' });
  }
  const showAll = req.user.role !== 'estudiante';
  try {
    res.json(await asistenciasService.getForDate(curso_id, fecha, req.user.id, showAll));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const upsertMany = async (req, res) => {
  const { curso_id, fecha, records } = req.body;
  if (!curso_id || !fecha || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'curso_id, fecha y records[] son requeridos' });
  }
  try {
    const results = await asistenciasService.upsertMany(curso_id, fecha, records);
    res.json({ saved: results.length, results });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { getForDate, upsertMany };
