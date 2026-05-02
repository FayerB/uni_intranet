import api from './index';

export const getEventos    = (params)    => api.get('/calendario', { params });
export const getEvento     = (id)        => api.get(`/calendario/${id}`);
export const createEvento  = (data)      => api.post('/calendario', data);
export const updateEvento  = (id, data)  => api.put(`/calendario/${id}`, data);
export const deleteEvento  = (id)        => api.delete(`/calendario/${id}`);
