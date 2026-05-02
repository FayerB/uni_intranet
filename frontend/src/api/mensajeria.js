import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

export const mensajeriaAPI = {
  getConversaciones: ()           => fetchSafe(api.get('/mensajeria'),                  MOCK.conversaciones),
  iniciarDirecta:    (data)       => api.post('/mensajeria/iniciar', data),
  getMensajes:       (id)         => fetchSafe(api.get(`/mensajeria/${id}/mensajes`),   []),
  enviar:            (id, data)   => api.post(`/mensajeria/${id}/mensajes`, data),
};
