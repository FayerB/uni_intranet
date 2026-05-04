import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

const mapConversacion = (c) => ({
  ...c,
  nombre: c.nombre || c.otros_nombres?.[0] || 'Sin nombre',
});

export const mensajeriaAPI = {
  getConversaciones: () =>
    fetchSafe(
      api.get('/mensajeria').then((r) => ({ ...r, data: (r.data || []).map(mapConversacion) })),
      MOCK.conversaciones
    ),
  iniciarDirecta:  (usuario_id) => api.post('/mensajeria/iniciar', { usuario_id }),
  getMensajes:     (id)         => fetchSafe(api.get(`/mensajeria/${id}/mensajes`), []),
  enviar:          (id, data)   => api.post(`/mensajeria/${id}/mensajes`, data),
};
