import api from './index';

// Adapta el formato del backend (/api/clases) al formato que usa ClasesVirtualesPage
const adapt = (c) => ({
  ...c,
  enlace:     c.url_reunion,    // la página usa .enlace
  fecha_hora: c.fecha_inicio,   // la página usa .fecha_hora
  docente:    c.creado_por,
});

export const clasesAPI = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/clases', { params });
    return Array.isArray(data) ? data.map(adapt) : [];
  },

  create: (data) =>
    api.post('/clases', {
      ...data,
      url_reunion:  data.enlace,      // mapeo inverso
      fecha_inicio: data.fecha_hora,
    }),

  update: (id, data) =>
    api.put(`/clases/${id}`, {
      ...data,
      url_reunion:  data.enlace,
      fecha_inicio: data.fecha_hora,
    }),

  remove: (id) => api.delete(`/clases/${id}`),
};
