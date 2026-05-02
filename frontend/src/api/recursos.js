import api from './index';

export const getRecursos      = (params)      => api.get('/recursos', { params });
export const getRecurso       = (id)          => api.get(`/recursos/${id}`);
export const createRecurso    = (data)        => api.post('/recursos', data);
export const deleteRecurso    = (id)          => api.delete(`/recursos/${id}`);
export const descargarRecurso = (id)          => api.post(`/recursos/${id}/descargar`);
export const getCategorias    = ()            => api.get('/recursos/categorias');
export const createCategoria  = (data)        => api.post('/recursos/categorias', data);
