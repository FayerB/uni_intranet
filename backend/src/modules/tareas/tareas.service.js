const pool = require('../../config/db');

// ─── Tareas ───────────────────────────────────────────────────────────────────

const BASE_TAREA = `
  SELECT t.*,
    c.nombre AS curso_nombre,
    u.nombre || ' ' || u.apellido AS docente_nombre,
    COUNT(e.id) FILTER (WHERE e.estado != 'pendiente')::int AS entregas_count
  FROM tareas t
  JOIN cursos c ON c.id = t.curso_id
  JOIN usuarios u ON u.id = t.creado_por
  LEFT JOIN entregas e ON e.tarea_id = t.id
`;

const fmtTarea = (r) => ({
  id:                     r.id,
  curso_id:               r.curso_id,
  curso:                  r.curso_nombre,
  docente:                r.docente_nombre,
  titulo:                 r.titulo,
  descripcion:            r.descripcion,
  fecha_entrega:          r.fecha_entrega,
  puntaje_max:            parseFloat(r.puntaje_max),
  tipo:                   r.tipo,
  permite_entrega_tardia: r.permite_entrega_tardia,
  activa:                 r.activa,
  entregas_count:         r.entregas_count ?? 0,
  created_at:             r.created_at,
});

const getByCurso = async (curso_id) => {
  const { rows } = await pool.query(
    BASE_TAREA + ' WHERE t.curso_id = $1 GROUP BY t.id, c.nombre, u.nombre, u.apellido ORDER BY t.fecha_entrega ASC',
    [curso_id]
  );
  return rows.map(fmtTarea);
};

const getByEstudiante = async (estudiante_id) => {
  const { rows } = await pool.query(
    BASE_TAREA + `
    JOIN matriculas m ON m.curso_id = t.curso_id
    WHERE m.estudiante_id = $1 AND m.estado = 'activo' AND t.activa = true
    GROUP BY t.id, c.nombre, u.nombre, u.apellido
    ORDER BY t.fecha_entrega ASC`,
    [estudiante_id]
  );
  return rows.map(fmtTarea);
};

const getById = async (id) => {
  const { rows } = await pool.query(
    BASE_TAREA + ' WHERE t.id = $1 GROUP BY t.id, c.nombre, u.nombre, u.apellido',
    [id]
  );
  if (!rows[0]) throw new Error('Tarea no encontrada');
  return fmtTarea(rows[0]);
};

const create = async (data, creado_por) => {
  const { curso_id, titulo, descripcion, fecha_entrega, puntaje_max, tipo, permite_entrega_tardia } = data;
  const { rows } = await pool.query(
    `INSERT INTO tareas (curso_id, titulo, descripcion, fecha_entrega, puntaje_max, tipo, permite_entrega_tardia, creado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [curso_id, titulo, descripcion || null, fecha_entrega, puntaje_max ?? 20,
     tipo || 'tarea', permite_entrega_tardia ?? false, creado_por]
  );
  return getById(rows[0].id);
};

const update = async (id, data) => {
  const allowed = ['titulo', 'descripcion', 'fecha_entrega', 'puntaje_max', 'tipo', 'permite_entrega_tardia', 'activa'];
  const fields = [], params = [];
  for (const k of allowed) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${k} = $${params.length}`); }
  }
  if (!fields.length) throw new Error('Nada que actualizar');
  params.push(id);
  await pool.query(
    `UPDATE tareas SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`,
    params
  );
  return getById(id);
};

const remove = async (id) => {
  await pool.query('UPDATE tareas SET activa = false WHERE id = $1', [id]);
  return { message: 'Tarea desactivada' };
};

// ─── Entregas ─────────────────────────────────────────────────────────────────

const BASE_ENTREGA = `
  SELECT e.*,
    u.nombre || ' ' || u.apellido AS estudiante_nombre,
    u.email AS estudiante_email,
    a.url AS archivo_url, a.nombre_original AS archivo_nombre
  FROM entregas e
  JOIN usuarios u ON u.id = e.estudiante_id
  LEFT JOIN archivos a ON a.id = e.archivo_id
`;

const fmtEntrega = (r) => ({
  id:                r.id,
  tarea_id:          r.tarea_id,
  estudiante_id:     r.estudiante_id,
  estudiante:        r.estudiante_nombre,
  email:             r.estudiante_email,
  contenido:         r.contenido,
  archivo_url:       r.archivo_url,
  archivo_nombre:    r.archivo_nombre,
  calificacion:      r.calificacion !== null ? parseFloat(r.calificacion) : null,
  comentario_docente: r.comentario_docente,
  estado:            r.estado,
  entregado_en:      r.entregado_en,
  calificado_en:     r.calificado_en,
});

const getEntregasByTarea = async (tarea_id) => {
  const { rows } = await pool.query(
    BASE_ENTREGA + ' WHERE e.tarea_id = $1 ORDER BY e.entregado_en DESC NULLS LAST',
    [tarea_id]
  );
  return rows.map(fmtEntrega);
};

const getEntregaByEstudiante = async (tarea_id, estudiante_id) => {
  const { rows } = await pool.query(
    BASE_ENTREGA + ' WHERE e.tarea_id = $1 AND e.estudiante_id = $2',
    [tarea_id, estudiante_id]
  );
  return rows[0] ? fmtEntrega(rows[0]) : null;
};

const entregar = async (tarea_id, estudiante_id, { contenido, archivo_id }) => {
  // Verificar que la tarea exista y esté activa
  const { rows: [tarea] } = await pool.query(
    'SELECT fecha_entrega, permite_entrega_tardia, activa FROM tareas WHERE id = $1',
    [tarea_id]
  );
  if (!tarea) throw new Error('Tarea no encontrada');
  if (!tarea.activa) throw new Error('La tarea no está activa');
  if (!tarea.permite_entrega_tardia && new Date() > new Date(tarea.fecha_entrega)) {
    throw new Error('La fecha de entrega ya pasó');
  }

  const { rows } = await pool.query(
    `INSERT INTO entregas (tarea_id, estudiante_id, contenido, archivo_id, estado, entregado_en)
     VALUES ($1,$2,$3,$4,'entregado', NOW())
     ON CONFLICT (tarea_id, estudiante_id)
     DO UPDATE SET contenido = $3, archivo_id = $4, estado = 'entregado', entregado_en = NOW(), updated_at = NOW()
     RETURNING id`,
    [tarea_id, estudiante_id, contenido || null, archivo_id || null]
  );
  return getEntregaByEstudiante(tarea_id, estudiante_id);
};

const calificar = async (entrega_id, docente_id, { calificacion, comentario_docente }) => {
  const { rows } = await pool.query(
    `UPDATE entregas
     SET calificacion = $1, comentario_docente = $2, estado = 'calificado',
         calificado_en = NOW(), calificado_por = $3, updated_at = NOW()
     WHERE id = $4 RETURNING tarea_id, estudiante_id`,
    [calificacion, comentario_docente || null, docente_id, entrega_id]
  );
  if (!rows[0]) throw new Error('Entrega no encontrada');
  return { message: 'Calificación registrada', entrega_id };
};

module.exports = {
  getByCurso, getByEstudiante, getById, create, update, remove,
  getEntregasByTarea, getEntregaByEstudiante, entregar, calificar,
};
