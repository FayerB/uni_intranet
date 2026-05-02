import api from './index';

export const historialAPI = {
  // Devuelve el historial del estudiante logueado agrupado por ciclo
  get: async () => {
    const { data } = await api.get('/notas/historial');
    return data;
  },

  // Para admin/docente/padre: historial de un estudiante específico
  getByEstudiante: async (estudianteId) => {
    const { data } = await api.get(`/notas/historial/${estudianteId}`);
    return data;
  },
};
