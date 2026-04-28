import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

// GET  /clases-virtuales         → lista (acepta ?estado=&curso_id=)
// POST /clases-virtuales         → crear
// PUT  /clases-virtuales/:id     → editar
// DELETE /clases-virtuales/:id   → eliminar / cancelar
// TODO: implementar endpoints en el backend

export const clasesAPI = {
  getAll: (params = {}) =>
    fetchSafe(api.get('/clases-virtuales', { params }), MOCK.clasesVirtuales),

  create: (data) =>
    api.post('/clases-virtuales', data),

  update: (id, data) =>
    api.put(`/clases-virtuales/${id}`, data),

  remove: (id) =>
    api.delete(`/clases-virtuales/${id}`),
};
