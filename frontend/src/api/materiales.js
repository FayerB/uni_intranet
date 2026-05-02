import api from './index';

// Mapeo de tipos: el backend usa 'enlace'/'documento', la página usa 'link'/'doc'
const TIPO_BACK_TO_PAGE = { enlace: 'link', documento: 'doc', imagen: 'pdf', audio: 'doc', otro: 'doc' };
const TIPO_PAGE_TO_BACK = { link: 'enlace', doc: 'documento', pdf: 'pdf', video: 'video' };

const adapt = (r) => ({
  ...r,
  enlace: r.url,                          // la página usa .enlace
  docente: r.subido_por,                  // la página usa .docente
  fecha: r.created_at?.slice(0, 10),      // la página usa .fecha
  tipo: TIPO_BACK_TO_PAGE[r.tipo] || r.tipo,
});

export const materialesAPI = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/recursos', { params });
    const items = Array.isArray(data) ? data : (data.data ?? []);
    return items.map(adapt);
  },

  getByCurso: async (cursoId) => {
    const { data } = await api.get('/recursos', { params: { curso_id: cursoId } });
    const items = Array.isArray(data) ? data : (data.data ?? []);
    return items.map(adapt);
  },

  create: (data) =>
    api.post('/recursos', {
      titulo: data.titulo,
      tipo: TIPO_PAGE_TO_BACK[data.tipo] || data.tipo || 'otro',
      url: data.enlace,
      curso_id: data.curso_id || null,
      publicado: true,
    }),

  remove: (id) => api.delete(`/recursos/${id}`),
};
