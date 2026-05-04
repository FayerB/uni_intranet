const Joi = require('joi');

/**
 * Middleware factory: valida req.body contra un schema Joi.
 * Uso: router.post('/', validate(schema), ctrl.create)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ message: 'Datos inválidos', errors });
  }
  req[source] = value;
  next();
};

// ─── Schemas reutilizables ────────────────────────────────────────────────────

const schemas = {
  uuid: Joi.string().uuid({ version: 'uuidv4' }),

  paginacion: Joi.object({
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),

  usuario: Joi.object({
    nombre:   Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(6).max(72).required(),
    rol:      Joi.string().valid('estudiante', 'docente', 'admin', 'padre').default('estudiante'),
    telefono: Joi.string().max(20).allow('', null),
    bio:      Joi.string().max(500).allow('', null),
  }),

  curso: Joi.object({
    codigo:      Joi.string().max(20).required(),
    nombre:      Joi.string().max(120).required(),
    descripcion: Joi.string().max(1000).allow('', null),
    creditos:    Joi.number().integer().min(1).max(10).default(3),
    ciclo:       Joi.string().max(10).allow('', null),
    tipo:        Joi.string().valid('Obligatorio', 'Electivo', 'Libre').default('Obligatorio'),
    imagen_url:  Joi.string().uri().allow('', null),
    docente_id:  Joi.string().uuid().allow(null),
    periodo_id:  Joi.string().uuid().allow(null),
  }),

  tarea: Joi.object({
    curso_id:               Joi.string().uuid().required(),
    titulo:                 Joi.string().max(200).required(),
    descripcion:            Joi.string().max(5000).allow('', null),
    fecha_entrega:          Joi.date().iso().required(),
    puntaje_max:            Joi.number().min(0).max(100).default(20),
    tipo:                   Joi.string().valid('tarea', 'proyecto', 'laboratorio', 'practica').default('tarea'),
    permite_entrega_tardia: Joi.boolean().default(false),
  }),

  entrega: Joi.object({
    contenido:  Joi.string().max(10000).allow('', null),
    archivo_id: Joi.string().uuid().allow(null),
  }),

  calificarEntrega: Joi.object({
    calificacion:      Joi.number().min(0).max(100).required(),
    comentario_docente: Joi.string().max(1000).allow('', null),
  }),

  examen: Joi.object({
    curso_id:             Joi.string().uuid().required(),
    titulo:               Joi.string().max(200).required(),
    descripcion:          Joi.string().max(2000).allow('', null),
    tipo:                 Joi.string().valid('parcial', 'final', 'practica', 'quiz').default('parcial'),
    duracion_minutos:     Joi.number().integer().min(5).max(480).default(60),
    puntaje_max:          Joi.number().min(0).max(100).default(20),
    intentos_max:         Joi.number().integer().min(1).max(10).default(1),
    fecha_inicio:         Joi.date().iso().required(),
    fecha_fin:            Joi.date().iso().min(Joi.ref('fecha_inicio')).required(),
    aleatorizar_preguntas: Joi.boolean().default(false),
    aleatorizar_opciones:  Joi.boolean().default(false),
    mostrar_resultados:    Joi.string().valid('inmediato', 'al_cerrar', 'manual').default('inmediato'),
  }),

  pregunta: Joi.object({
    enunciado:  Joi.string().required(),
    tipo:       Joi.string().valid('multiple', 'verdadero_falso', 'desarrollo', 'completar').required(),
    puntaje:    Joi.number().min(0).max(100).default(1),
    orden:      Joi.number().integer().min(0).default(0),
    imagen_url: Joi.string().uri().allow('', null),
    opciones: Joi.when('tipo', {
      is: Joi.valid('multiple', 'verdadero_falso'),
      then: Joi.array().items(Joi.object({
        texto:       Joi.string().required(),
        es_correcta: Joi.boolean().required(),
        orden:       Joi.number().integer().default(0),
      })).min(2).required(),
      otherwise: Joi.array().default([]),
    }),
  }),

  mensaje: Joi.object({
    contenido:  Joi.string().max(5000).required(),
    archivo_id: Joi.string().uuid().allow(null),
  }),

  iniciarDirecta: Joi.object({
    usuario_id: Joi.string().uuid({ version: ['uuidv4'] }).required(),
  }),

  recurso: Joi.object({
    titulo:       Joi.string().max(200).required(),
    descripcion:  Joi.string().max(2000).allow('', null),
    tipo:         Joi.string().valid('pdf', 'video', 'enlace', 'imagen', 'audio', 'documento', 'otro').required(),
    url:          Joi.string().uri().allow('', null),
    archivo_id:   Joi.string().uuid().allow(null),
    curso_id:     Joi.string().uuid().allow(null),
    categoria_id: Joi.string().uuid().allow(null),
    publicado:    Joi.boolean().default(true),
    etiquetas:    Joi.array().items(Joi.string().max(50)).default([]),
  }),

  evento: Joi.object({
    titulo:       Joi.string().max(200).required(),
    descripcion:  Joi.string().max(1000).allow('', null),
    tipo:         Joi.string().valid('academico', 'tarea', 'examen', 'clase_virtual', 'feriado', 'otro').default('academico'),
    fecha_inicio: Joi.date().iso().required(),
    fecha_fin:    Joi.date().iso().allow(null),
    todo_el_dia:  Joi.boolean().default(false),
    curso_id:     Joi.string().uuid().allow(null),
    es_global:    Joi.boolean().default(false),
    color:        Joi.string().max(20).default('#3B82F6'),
  }),

  ticket: Joi.object({
    asunto:      Joi.string().max(200).required(),
    descripcion: Joi.string().max(5000).required(),
    categoria:   Joi.string().valid('general', 'tecnico', 'academico', 'pagos', 'acceso').default('general'),
    prioridad:   Joi.string().valid('baja', 'media', 'alta', 'urgente').default('media'),
  }),

  horario: Joi.object({
    curso_id:    Joi.string().uuid().required(),
    dia_semana:  Joi.number().integer().min(1).max(7).required(),
    hora_inicio: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    hora_fin:    Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    aula:        Joi.string().max(30).allow('', null),
    modalidad:   Joi.string().valid('presencial', 'virtual', 'hibrido').default('presencial'),
  }),

  claseVirtual: Joi.object({
    curso_id:     Joi.string().uuid().required(),
    titulo:       Joi.string().max(150).required(),
    descripcion:  Joi.string().max(2000).allow('', null),
    url_reunion:  Joi.string().uri().allow('', null),
    plataforma:   Joi.string().valid('zoom', 'meet', 'teams', 'otro').default('zoom'),
    fecha_inicio: Joi.date().iso().required(),
    fecha_fin:    Joi.date().iso().allow(null),
  }),
};

module.exports = { validate, schemas };
