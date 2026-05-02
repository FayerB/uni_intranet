const svc = require('./archivos.service');

const upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió ningún archivo' });
    const { entidad_tipo, entidad_id } = req.body;
    const archivo = await svc.guardar(req.file, {
      subido_por: req.user.id,
      entidad_tipo,
      entidad_id,
    });
    res.status(201).json(archivo);
  } catch (e) { next(e); }
};

const eliminar = async (req, res, next) => {
  try { res.json(await svc.eliminar(req.params.id, req.user.id)); } catch (e) { next(e); }
};

module.exports = { upload, eliminar };
