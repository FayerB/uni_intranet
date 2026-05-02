import api from './index';

export const getExamenesByCurso = (cursoId)         => api.get(`/examenes/curso/${cursoId}`);
export const getExamen          = (id)               => api.get(`/examenes/${id}`);
export const createExamen       = (data)             => api.post('/examenes', data);
export const updateExamen       = (id, data)         => api.put(`/examenes/${id}`, data);
export const deleteExamen       = (id)               => api.delete(`/examenes/${id}`);

// Preguntas
export const addPregunta        = (examenId, data)   => api.post(`/examenes/${examenId}/preguntas`, data);
export const removePregunta     = (examenId, pId)    => api.delete(`/examenes/${examenId}/preguntas/${pId}`);

// Rendición
export const iniciarIntento     = (examenId)         => api.post(`/examenes/${examenId}/iniciar`);
export const guardarRespuesta   = (intentoId, data)  => api.post(`/examenes/intentos/${intentoId}/respuesta`, data);
export const finalizarIntento   = (intentoId)        => api.post(`/examenes/intentos/${intentoId}/finalizar`);
export const getResultados      = (examenId)         => api.get(`/examenes/${examenId}/resultados`);
