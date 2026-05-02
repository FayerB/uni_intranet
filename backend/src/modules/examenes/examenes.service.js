const pool = require('../../config/db');

// ─── Exámenes ─────────────────────────────────────────────────────────────────

const fmtExamen = (r) => ({
  id:                     r.id,
  curso_id:               r.curso_id,
  curso:                  r.curso_nombre,
  titulo:                 r.titulo,
  descripcion:            r.descripcion,
  tipo:                   r.tipo,
  duracion_minutos:       r.duracion_minutos,
  puntaje_max:            parseFloat(r.puntaje_max),
  intentos_max:           r.intentos_max,
  fecha_inicio:           r.fecha_inicio,
  fecha_fin:              r.fecha_fin,
  aleatorizar_preguntas:  r.aleatorizar_preguntas,
  mostrar_resultados:     r.mostrar_resultados,
  activo:                 r.activo,
  preguntas_count:        r.preguntas_count ?? 0,
  created_at:             r.created_at,
});

const BASE = `
  SELECT e.*, c.nombre AS curso_nombre, COUNT(p.id)::int AS preguntas_count
  FROM examenes e
  JOIN cursos c ON c.id = e.curso_id
  LEFT JOIN preguntas p ON p.examen_id = e.id
`;
const GROUP = 'GROUP BY e.id, c.nombre';

const getByCurso = async (curso_id) => {
  const { rows } = await pool.query(
    BASE + ' WHERE e.curso_id = $1 ' + GROUP + ' ORDER BY e.fecha_inicio ASC',
    [curso_id]
  );
  return rows.map(fmtExamen);
};

const getById = async (id, incluirRespuestas = false) => {
  const { rows } = await pool.query(BASE + ' WHERE e.id = $1 ' + GROUP, [id]);
  if (!rows[0]) throw new Error('Examen no encontrado');
  const examen = fmtExamen(rows[0]);

  // Preguntas con opciones
  const { rows: preguntas } = await pool.query(
    'SELECT * FROM preguntas WHERE examen_id = $1 ORDER BY orden ASC', [id]
  );

  for (const p of preguntas) {
    const { rows: opciones } = await pool.query(
      `SELECT id, texto, orden ${incluirRespuestas ? ', es_correcta' : ''}
       FROM opciones_pregunta WHERE pregunta_id = $1 ORDER BY orden`,
      [p.id]
    );
    p.opciones = opciones;
    if (!incluirRespuestas) delete p.imagen_url; // no revelar respuestas
  }
  examen.preguntas = preguntas;
  return examen;
};

const create = async (data, creado_por) => {
  const { rows } = await pool.query(
    `INSERT INTO examenes
       (curso_id, titulo, descripcion, tipo, duracion_minutos, puntaje_max,
        intentos_max, fecha_inicio, fecha_fin, aleatorizar_preguntas,
        aleatorizar_opciones, mostrar_resultados, creado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
    [data.curso_id, data.titulo, data.descripcion || null, data.tipo || 'parcial',
     data.duracion_minutos || 60, data.puntaje_max ?? 20, data.intentos_max || 1,
     data.fecha_inicio, data.fecha_fin, data.aleatorizar_preguntas ?? false,
     data.aleatorizar_opciones ?? false, data.mostrar_resultados || 'inmediato', creado_por]
  );
  return getById(rows[0].id, true);
};

const update = async (id, data) => {
  const allowed = ['titulo', 'descripcion', 'tipo', 'duracion_minutos', 'puntaje_max',
                   'intentos_max', 'fecha_inicio', 'fecha_fin', 'aleatorizar_preguntas',
                   'aleatorizar_opciones', 'mostrar_resultados', 'activo'];
  const fields = [], params = [];
  for (const k of allowed) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${k} = $${params.length}`); }
  }
  if (!fields.length) throw new Error('Nada que actualizar');
  params.push(id);
  await pool.query(`UPDATE examenes SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`, params);
  return getById(id, true);
};

const remove = async (id) => {
  await pool.query('UPDATE examenes SET activo = false WHERE id = $1', [id]);
  return { message: 'Examen desactivado' };
};

// ─── Preguntas ────────────────────────────────────────────────────────────────

const addPregunta = async (examen_id, data) => {
  const { enunciado, tipo, puntaje, orden, imagen_url, opciones = [] } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [p] } = await client.query(
      'INSERT INTO preguntas (examen_id, enunciado, tipo, puntaje, orden, imagen_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [examen_id, enunciado, tipo, puntaje ?? 1, orden ?? 0, imagen_url || null]
    );
    for (const op of opciones) {
      await client.query(
        'INSERT INTO opciones_pregunta (pregunta_id, texto, es_correcta, orden) VALUES ($1,$2,$3,$4)',
        [p.id, op.texto, op.es_correcta ?? false, op.orden ?? 0]
      );
    }
    await client.query('COMMIT');
    return p.id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const removePregunta = async (pregunta_id) => {
  await pool.query('DELETE FROM preguntas WHERE id = $1', [pregunta_id]);
  return { message: 'Pregunta eliminada' };
};

// ─── Intentos / Rendición ─────────────────────────────────────────────────────

const iniciarIntento = async (examen_id, estudiante_id) => {
  const { rows: [examen] } = await pool.query(
    'SELECT * FROM examenes WHERE id = $1 AND activo = true', [examen_id]
  );
  if (!examen) throw new Error('Examen no disponible');
  if (new Date() < new Date(examen.fecha_inicio)) throw new Error('El examen aún no ha comenzado');
  if (new Date() > new Date(examen.fecha_fin))    throw new Error('El examen ya cerró');

  const { rows: intentos } = await pool.query(
    `SELECT COUNT(*)::int AS cnt FROM intentos_examen
     WHERE examen_id = $1 AND estudiante_id = $2 AND estado != 'anulado'`,
    [examen_id, estudiante_id]
  );
  if (intentos[0].cnt >= examen.intentos_max) throw new Error('Se agotaron los intentos permitidos');

  const numero = intentos[0].cnt + 1;
  const { rows: [intento] } = await pool.query(
    `INSERT INTO intentos_examen (examen_id, estudiante_id, numero)
     VALUES ($1,$2,$3) RETURNING id`,
    [examen_id, estudiante_id, numero]
  );

  // Devolver preguntas (sin respuestas correctas)
  const examenData = await getById(examen_id, false);
  if (examen.aleatorizar_preguntas) {
    examenData.preguntas.sort(() => Math.random() - 0.5);
  }
  return { intento_id: intento.id, duracion_minutos: examen.duracion_minutos, preguntas: examenData.preguntas };
};

const guardarRespuesta = async (intento_id, pregunta_id, { opcion_id, respuesta_texto }) => {
  await pool.query(
    `INSERT INTO respuestas_examen (intento_id, pregunta_id, opcion_id, respuesta_texto)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (intento_id, pregunta_id)
     DO UPDATE SET opcion_id = $3, respuesta_texto = $4`,
    [intento_id, pregunta_id, opcion_id || null, respuesta_texto || null]
  );
  return { ok: true };
};

const finalizarIntento = async (intento_id, estudiante_id) => {
  const { rows: [intento] } = await pool.query(
    `SELECT i.*, e.puntaje_max, e.mostrar_resultados
     FROM intentos_examen i JOIN examenes e ON e.id = i.examen_id
     WHERE i.id = $1 AND i.estudiante_id = $2`,
    [intento_id, estudiante_id]
  );
  if (!intento) throw new Error('Intento no encontrado');
  if (intento.estado !== 'en_curso') throw new Error('Este intento ya fue finalizado');

  // Calcular puntaje automático para preguntas de opción múltiple
  const { rows: respuestas } = await pool.query(
    `SELECT r.*, p.tipo, p.puntaje, op.es_correcta
     FROM respuestas_examen r
     JOIN preguntas p ON p.id = r.pregunta_id
     LEFT JOIN opciones_pregunta op ON op.id = r.opcion_id
     WHERE r.intento_id = $1`,
    [intento_id]
  );

  let puntaje_total = 0;
  for (const r of respuestas) {
    if (r.tipo === 'multiple' || r.tipo === 'verdadero_falso') {
      const correcto = r.es_correcta === true;
      const pts = correcto ? parseFloat(r.puntaje) : 0;
      puntaje_total += pts;
      await pool.query(
        'UPDATE respuestas_examen SET es_correcta = $1, puntaje_obtenido = $2 WHERE id = $3',
        [correcto, pts, r.id]
      );
    }
    // 'desarrollo' y 'completar' requieren corrección manual
  }

  const puntaje_final = Math.min(puntaje_total, parseFloat(intento.puntaje_max));
  await pool.query(
    `UPDATE intentos_examen SET estado = 'finalizado', finalizado_en = NOW(), puntaje = $1 WHERE id = $2`,
    [puntaje_final, intento_id]
  );

  return {
    intento_id,
    puntaje: puntaje_final,
    puntaje_max: parseFloat(intento.puntaje_max),
    resultado: intento.mostrar_resultados === 'inmediato' ? 'aprobado/desaprobado evaluado' : 'pendiente de revisión',
  };
};

const getResultadosByExamen = async (examen_id) => {
  const { rows } = await pool.query(
    `SELECT i.id, i.numero, i.puntaje, i.estado, i.iniciado_en, i.finalizado_en,
       u.nombre || ' ' || u.apellido AS estudiante, u.email
     FROM intentos_examen i
     JOIN usuarios u ON u.id = i.estudiante_id
     WHERE i.examen_id = $1
     ORDER BY i.puntaje DESC NULLS LAST`,
    [examen_id]
  );
  return rows;
};

module.exports = {
  getByCurso, getById, create, update, remove,
  addPregunta, removePregunta,
  iniciarIntento, guardarRespuesta, finalizarIntento, getResultadosByExamen,
};
