const noticiasService = require('./noticias.service');

const getAll = async (req, res) => {
  try {
    const noticias = await noticiasService.getAll(req.query);
    res.json(noticias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const noticia = await noticiasService.getById(req.params.id);
    res.json(noticia);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const create = async (req, res) => {
  const { titulo, resumen, contenido, categoria, imagen_url } = req.body;

  if (!titulo || !resumen || !contenido) {
    return res.status(400).json({ message: 'Campos requeridos: titulo, resumen, contenido' });
  }

  try {
    const noticia = await noticiasService.create({
      titulo, resumen, contenido, categoria, imagen_url,
      autor_id: req.user.id,
    });
    res.status(201).json(noticia);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const noticia = await noticiasService.update(req.params.id, req.body);
    res.json(noticia);
  } catch (error) {
    const status = error.message === 'Noticia no encontrada' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await noticiasService.remove(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
