import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

export const pagosAPI = {
  getMisPagos:     ()         => fetchSafe(api.get('/pagos/mis-pagos'),          MOCK.pagos),
  getConceptos:    ()         => fetchSafe(api.get('/pagos/conceptos'),           MOCK.conceptosPago),
  getAll:          ()         => fetchSafe(api.get('/pagos'),                     MOCK.pagos),
  getByEstudiante: (id)       => api.get(`/pagos/estudiante/${id}`),
  create:          (data)     => api.post('/pagos', data),
  registrar:       (id, data) => api.patch(`/pagos/${id}/registrar`, data),
  createConcepto:  (data)     => api.post('/pagos/conceptos', data),
};
