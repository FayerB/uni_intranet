import { createBrowserRouter, Navigate, Outlet, useRouteError, useNavigate } from 'react-router-dom';
import { useStore } from '../context/useStore';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import RoleGuard from '../components/auth/RoleGuard';

import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PerfilPage from '../pages/perfil/PerfilPage';
import UsuariosPage from '../pages/usuarios/UsuariosPage';
import CursosPage from '../pages/cursos/CursosPage';
import MatriculasPage from '../pages/matriculas/MatriculasPage';
import NotasPage from '../pages/notas/NotasPage';
import AsistenciaPage from '../pages/asistencia/AsistenciaPage';
import HorariosPage from '../pages/horarios/HorariosPage';
import NoticiasPage from '../pages/noticias/NoticiasPage';
import ReportesPage from '../pages/reportes/ReportesPage';
import ClasesVirtualesPage from '../pages/clases/ClasesVirtualesPage';
import MaterialCursoPage from '../pages/material/MaterialCursoPage';
import HistorialPage from '../pages/historial/HistorialPage';

function PrivateRoute() {
  const { user } = useStore();
  const token = localStorage.getItem('token');
  return user && token ? <Outlet /> : <Navigate to="/" replace />;
}

const ROUTE_ROLES = {
  usuarios:   ['admin'],
  cursos:     ['admin', 'docente'],
  matriculas: ['admin', 'estudiante'],
  reportes:   ['admin'],
  historial:  ['estudiante', 'admin'],
};

function PageError() {
  const error = useRouteError();
  const navigate = useNavigate();
  const isDomError = error?.message?.includes('removeChild') || error?.message?.includes('not a child');

  if (isDomError) {
    // Silent recovery for browser-extension DOM interference
    navigate(0); // force page reload to reset DOM
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Algo salió mal</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          {error?.message || 'Error inesperado en la aplicación.'}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <PageError />,
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    errorElement: <PageError />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        errorElement: <PageError />,
        children: [
          { path: 'dashboard',  element: <DashboardPage /> },
          { path: 'perfil',     element: <PerfilPage /> },
          { path: 'notas',      element: <NotasPage /> },
          { path: 'asistencia', element: <AsistenciaPage /> },
          { path: 'horarios',   element: <HorariosPage /> },
          { path: 'noticias',   element: <NoticiasPage /> },
          { path: 'clases',    element: <ClasesVirtualesPage /> },
          { path: 'material',  element: <MaterialCursoPage /> },
          {
            path: 'historial',
            element: (
              <RoleGuard allowed={ROUTE_ROLES.historial}>
                <HistorialPage />
              </RoleGuard>
            ),
          },
          {
            path: 'usuarios',
            element: (
              <RoleGuard allowed={ROUTE_ROLES.usuarios}>
                <UsuariosPage />
              </RoleGuard>
            ),
          },
          {
            path: 'cursos',
            element: (
              <RoleGuard allowed={ROUTE_ROLES.cursos}>
                <CursosPage />
              </RoleGuard>
            ),
          },
          {
            path: 'matriculas',
            element: (
              <RoleGuard allowed={ROUTE_ROLES.matriculas}>
                <MatriculasPage />
              </RoleGuard>
            ),
          },
          {
            path: 'reportes',
            element: (
              <RoleGuard allowed={ROUTE_ROLES.reportes}>
                <ReportesPage />
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },
]);
