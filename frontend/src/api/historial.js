import api from './index';
import { fetchSafe } from './fetchSafe';
import { MOCK } from './mock';

export const historialAPI = {
  get: () =>
    fetchSafe(api.get('/historial-academico'), MOCK.historialAcademico),
};
