import { useStore } from '../context/useStore';

export const ROLES = {
  ADMIN:      'admin',
  DOCENTE:    'docente',
  ESTUDIANTE: 'estudiante',
};

export function useRole() {
  const { user } = useStore();
  const role = user?.role ?? null;

  return {
    role,
    isAdmin:      role === ROLES.ADMIN,
    isDocente:    role === ROLES.DOCENTE,
    isEstudiante: role === ROLES.ESTUDIANTE,
    can: (allowed) => allowed.includes(role),
  };
}
