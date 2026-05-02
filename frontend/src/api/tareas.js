import api from './index';

export const getTareas       = (params)             => api.get('/tareas/mias', { params });
export const getTareasByCurso = (cursoId)           => api.get(`/tareas/curso/${cursoId}`);
export const getTarea        = (id)                 => api.get(`/tareas/${id}`);
export const createTarea     = (data)               => api.post('/tareas', data);
export const updateTarea     = (id, data)           => api.put(`/tareas/${id}`, data);
export const deleteTarea     = (id)                 => api.delete(`/tareas/${id}`);

// Entregas
export const getEntregas     = (tareaId)            => api.get(`/tareas/${tareaId}/entregas`);
export const getMiEntrega    = (tareaId)            => api.get(`/tareas/${tareaId}/mi-entrega`);
export const entregar        = (tareaId, data)      => api.post(`/tareas/${tareaId}/entregar`, data);
export const calificar       = (tareaId, entregaId, data) =>
  api.put(`/tareas/${tareaId}/entregas/${entregaId}/calificar`, data);
