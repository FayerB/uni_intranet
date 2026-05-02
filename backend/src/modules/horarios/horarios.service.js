const pool = require('../../config/db');

const DIAS = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };

const fmt = (r) => ({
  id:          r.id,
  curso_id:    r.curso_id,
  curso:       r.curso_nombre ? `${r.curso_nombre} (${r.curso_codigo})` : null,
  dia_semana:  r.dia_semana,
  dia_nombre:  DIAS[r.dia_semana],
  hora_inicio: r.hora_inicio,
  hora_fin:    r.hora_fin,
  aula:        r.aula,
  modalidad:   r.modalidad,
});

const BASE = `
  SELECT h.*, c.nombre AS curso_nombre, c.codigo AS curso_codigo
  FROM horarios h
  LEFT JOIN cursos c ON c.id = h.curso_id
`;

const getByCurso = async (curso_id) => {
  const { rows } = await pool.query(
    BASE + ' WHERE h.curso_id = $1 ORDER BY h.dia_semana, h.hora_inicio',
    [curso_id]
  );
  return rows.map(fmt);
};

const getByDocente = async (docente_id) => {
  const { rows } = await pool.query(
    BASE + ' JOIN cursos cc ON cc.id = h.curso_id WHERE cc.docente_id = $1 ORDER BY h.dia_semana, h.hora_inicio',
    [docente_id]
  );
  return rows.map(fmt);
};

const getByEstudiante = async (estudiante_id) => {
  const { rows } = await pool.query(
    BASE + `
    JOIN matriculas m ON m.curso_id = h.curso_id
    WHERE m.estudiante_id = $1 AND m.estado = 'activo'
    ORDER BY h.dia_semana, h.hora_inicio`,
    [estudiante_id]
  );
  return rows.map(fmt);
};

const create = async (data) => {
  const { curso_id, dia_semana, hora_inicio, hora_fin, aula, modalidad } = data;
  const { rows } = await pool.query(
    `INSERT INTO horarios (curso_id, dia_semana, hora_inicio, hora_fin, aula, modalidad)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [curso_id, dia_semana, hora_inicio, hora_fin, aula || null, modalidad || 'presencial']
  );
  const { rows: [h] } = await pool.query(BASE + ' WHERE h.id = $1', [rows[0].id]);
  return fmt(h);
};

const update = async (id, data) => {
  const allowed = ['dia_semana', 'hora_inicio', 'hora_fin', 'aula', 'modalidad'];
  const fields = [], params = [];
  for (const k of allowed) {
    if (data[k] !== undefined) { params.push(data[k]); fields.push(`${k} = $${params.length}`); }
  }
  if (!fields.length) throw new Error('Nada que actualizar');
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE horarios SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING id`,
    params
  );
  if (!rows[0]) throw new Error('Horario no encontrado');
  const { rows: [h] } = await pool.query(BASE + ' WHERE h.id = $1', [id]);
  return fmt(h);
};

const remove = async (id) => {
  const { rows } = await pool.query('DELETE FROM horarios WHERE id = $1 RETURNING id', [id]);
  if (!rows[0]) throw new Error('Horario no encontrado');
  return { message: 'Horario eliminado' };
};

module.exports = { getByCurso, getByDocente, getByEstudiante, create, update, remove };
