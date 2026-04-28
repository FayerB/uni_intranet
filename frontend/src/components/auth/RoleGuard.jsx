import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';

/**
 * Protege rutas declarativamente por rol.
 * Si el rol del usuario no está en `allowed`, redirige a /dashboard.
 *
 * Uso:
 *   <RoleGuard allowed={['admin']}>
 *     <UsuariosPage />
 *   </RoleGuard>
 */
export default function RoleGuard({ allowed, children }) {
  const { can } = useRole();

  if (!can(allowed)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
