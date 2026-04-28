import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

// TODO: implementar endpoints en el backend
// GET  /notificaciones
// PATCH /notificaciones/:id/leer
// PATCH /notificaciones/leer-todas

export const notifAPI = {
  getAll: () =>
    fetchSafe(api.get('/notificaciones'), MOCK.notificaciones),

  markRead: (id) =>
    api.patch(`/notificaciones/${id}/leer`).catch(() => {}),

  markAllRead: () =>
    api.patch('/notificaciones/leer-todas').catch(() => {}),
};
