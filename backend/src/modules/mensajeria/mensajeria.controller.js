const svc = require('./mensajeria.service');

let _io = null;
const setIo = (io) => { _io = io; };

const getConversaciones = async (req, res, next) => {
  try { res.json(await svc.getConversaciones(req.user.id)); } catch (e) { next(e); }
};

const getMensajes = async (req, res, next) => {
  try {
    res.json(await svc.getMensajes(req.params.id, req.user.id, req.query));
  } catch (e) { next(e); }
};

const iniciarDirecta = async (req, res, next) => {
  try {
    const { usuario_id } = req.body;
    if (!usuario_id) return res.status(400).json({ message: 'usuario_id requerido' });
    const conv_id = await svc.getOCrearDirecta(req.user.id, usuario_id);
    res.json({ conversacion_id: conv_id });
  } catch (e) { next(e); }
};

const enviar = async (req, res, next) => {
  try {
    const { contenido, archivo_id } = req.body;
    if (!contenido) return res.status(400).json({ message: 'contenido requerido' });
    res.status(201).json(await svc.enviarMensaje(req.params.id, req.user.id, { contenido, archivo_id }, _io));
  } catch (e) { next(e); }
};

module.exports = { getConversaciones, getMensajes, iniciarDirecta, enviar, setIo };
