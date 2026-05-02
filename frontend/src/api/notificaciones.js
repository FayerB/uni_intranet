import api from './index';

// Ahora los endpoints existen realmente en el backend
export const notifAPI = {
  getAll:      (params) => api.get('/notificaciones', { params }).then((r) => r.data),
  count:       ()       => api.get('/notificaciones/count').then((r) => r.data.count),
  markRead:    (id)     => api.patch(`/notificaciones/${id}/leer`).catch(() => {}),
  markAllRead: ()       => api.patch('/notificaciones/leer-todas').catch(() => {}),
  delete:      (id)     => api.delete(`/notificaciones/${id}`),
};
