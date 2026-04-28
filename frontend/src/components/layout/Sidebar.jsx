import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, UserPlus, GraduationCap,
  CheckSquare, Calendar, Newspaper, BarChart3, User, Building2,
  Video, BookMarked, ScrollText, X, Sun, Moon, LogOut
} from 'lucide-react';
import { useStore } from '../../context/useStore';
import { useRole } from '../../hooks/useRole';

// roles: undefined = todos los roles autenticados, array = solo esos roles
const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/usuarios',   label: 'Usuarios',   icon: Users,         roles: ['admin'] },
  { path: '/cursos',     label: 'Cursos',     icon: BookOpen,      roles: ['admin', 'docente'] },
  { path: '/matriculas', label: 'Matrículas', icon: UserPlus,      roles: ['admin', 'estudiante'] },
  { path: '/notas',      label: 'Notas',      icon: GraduationCap },
  { path: '/asistencia', label: 'Asistencia',       icon: CheckSquare },
  { path: '/clases',    label: 'Clases Virtuales', icon: Video },
  { path: '/material',  label: 'Material de Curso', icon: BookMarked },
  { path: '/historial', label: 'Historial',          icon: ScrollText, roles: ['estudiante', 'admin'] },
  { path: '/horarios',  label: 'Horarios',            icon: Calendar },
  { path: '/noticias',   label: 'Noticias',   icon: Newspaper },
  { path: '/reportes',   label: 'Reportes',   icon: BarChart3,     roles: ['admin'] },
  { path: '/perfil',     label: 'Mi Perfil',  icon: User },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, theme, toggleTheme, setUser } = useStore();
  const navigate = useNavigate();
  const { role } = useRole();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <aside
      className={`fixed lg:static left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700
                   z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-sm
                   ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3 text-xl font-extrabold text-primary dark:text-primary-400">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Building2 size={24} className="text-primary" />
          </div>
          <span>UniIntranet</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      {/* Role badge */}
      {user && (
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Conectado como
          </p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
            {user.name}
          </p>
          <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
            ${role === 'admin'      ? 'bg-primary/10 text-primary' :
              role === 'docente'    ? 'bg-secondary/10 text-secondary' :
              'bg-success/10 text-success'}`}>
            {role}
          </span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
              ${isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <item.icon size={20} className="mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400
                   hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
        >
          <div className="flex items-center">
            {theme === 'light' ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
            <span>Apariencia</span>
          </div>
          <span className="text-xs uppercase tracking-wider opacity-60">{theme}</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-destructive
                   hover:bg-destructive/10 rounded-xl transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
