import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: '/', element: <LoginPage /> },
    ]
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/perfil', element: <PerfilPage /> },
      { path: '/usuarios', element: <UsuariosPage /> },
      { path: '/cursos', element: <CursosPage /> },
      { path: '/matriculas', element: <MatriculasPage /> },
      { path: '/notas', element: <NotasPage /> },
      { path: '/asistencia', element: <AsistenciaPage /> },
      { path: '/horarios', element: <HorariosPage /> },
      { path: '/noticias', element: <NoticiasPage /> },
      { path: '/reportes', element: <ReportesPage /> },
    ]
  }
]);