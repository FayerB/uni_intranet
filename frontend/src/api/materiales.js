import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

export const materialesAPI = {
  getAll: (params = {}) =>
    fetchSafe(api.get('/materiales', { params }), MOCK.materiales),

  getByCurso: (cursoId) =>
    fetchSafe(
      api.get('/materiales', { params: { curso_id: cursoId } }),
      MOCK.materiales.filter((m) => m.curso_id === cursoId)
    ),

  create: (data) => api.post('/materiales', data),

  remove: (id) => api.delete(`/materiales/${id}`),
};
