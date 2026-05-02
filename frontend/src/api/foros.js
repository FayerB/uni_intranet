import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

export const forosAPI = {
  getByCurso:   (cursoId)        => fetchSafe(api.get(`/foros/curso/${cursoId}`),     MOCK.foros),
  getHilos:     (foroId)         => fetchSafe(api.get(`/foros/${foroId}/hilos`),       MOCK.hilos),
  getHilo:      (hiloId)         => api.get(`/foros/hilos/${hiloId}`),
  createForo:   (data)           => api.post('/foros', data),
  createHilo:   (foroId, data)   => api.post(`/foros/${foroId}/hilos`, data),
  responder:    (hiloId, data)   => api.post(`/foros/hilos/${hiloId}/responder`, data),
  toggleFijado: (hiloId)         => api.patch(`/foros/hilos/${hiloId}/fijar`),
};
