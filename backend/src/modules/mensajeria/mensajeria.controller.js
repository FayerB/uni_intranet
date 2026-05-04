const svc = require('./mensajeria.service');
const { ApiError } = require('../../utils/apiError');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let _io = null;
const setIo = (io) => { _io = io; };

const getConversaciones = async (req, res, next) => {
  try { res.json(await svc.getConversaciones(req.user.id)); } catch (e) { next(e); }
};

const getMensajes = async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) return next(ApiError.badRequest('ID de conversación inválido'));
    res.json(await svc.getMensajes(req.params.id, req.user.id, req.query));
  } catch (e) { next(e); }
};

const iniciarDirecta = async (req, res, next) => {
  try {
    const { usuario_id } = req.body;
    if (usuario_id === req.user.id) return next(ApiError.badRequest('No puedes iniciar una conversación contigo mismo'));
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
