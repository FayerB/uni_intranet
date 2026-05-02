import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

export const soporteAPI = {
  getMios:       ()         => fetchSafe(api.get('/soporte/mios'),      MOCK.tickets),
  getAll:        ()         => fetchSafe(api.get('/soporte'),           MOCK.tickets),
  getById:       (id)       => api.get(`/soporte/${id}`),
  create:        (data)     => api.post('/soporte', data),
  responder:     (id, data) => api.post(`/soporte/${id}/responder`, data),
  cambiarEstado: (id, data) => api.patch(`/soporte/${id}/estado`, data),
};
