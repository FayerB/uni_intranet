import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

export const circularesAPI = {
  getAll:      ()         => fetchSafe(api.get('/circulares'), MOCK.circulares),
  create:      (data)     => api.post('/circulares', data),
  marcarLeida: (id)       => api.patch(`/circulares/${id}/leer`),
  remove:      (id)       => api.delete(`/circulares/${id}`),
};
