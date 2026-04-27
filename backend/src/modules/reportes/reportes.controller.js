const reportesService = require('./reportes.service');

const getUsuarios = async (_req, res) => {
  try {
    res.json(await reportesService.getUsuarios());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNoticias = async (_req, res) => {
  try {
    res.json(await reportesService.getNoticias());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResumen = async (_req, res) => {
  try {
    res.json(await reportesService.getResumen());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsuarios, getNoticias, getResumen };
