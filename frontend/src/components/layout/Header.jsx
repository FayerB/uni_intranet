import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/useStore';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, ChevronDown, User, Settings, LogOut, BookOpen, GraduationCap, UserCheck, Monitor, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsModal } from '../ui/SettingsModal';
import { notifAPI } from '../../api/notificaciones';

const TIPO_ICON = {
  clase:      <Monitor size={16} className="text-secondary" />,
  nota:       <GraduationCap size={16} className="text-success" />,
  matricula:  <UserCheck size={16} className="text-primary" />,
  asistencia: <AlertCircle size={16} className="text-warning" />,
  sistema:    <BookOpen size={16} className="text-gray-400" />,
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

export default function Header({ toggleSidebar }) {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen]   = useState(false);
  const [isNotifOpen, setIsNotifOpen]       = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifs, setNotifs]   = useState([]);
  const notifRef = useRef(null);

  useEffect(() => {
    notifAPI.getAll().then(setNotifs);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const unreadCount = notifs.filter((n) => !n.leida).length;

  const handleMarkRead = async (id) => {
    await notifAPI.markRead(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
  };

  const handleMarkAllRead = async () => {
    await notifAPI.markAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 z-40 sticky top-0">
      <div className="flex items-center">
        <button
          className="lg:hidden mr-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar estudiantes, cursos..."
            className="pl-10 pr-4 py-2.5 w-72 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50
                     text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                     transition-all duration-300 dark:text-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-5 relative">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-screen sm:w-80 max-w-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notificaciones
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Marcar todas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                  {notifs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">Sin notificaciones</p>
                  ) : (
                    notifs.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        className={`w-full text-left flex gap-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50
                          ${!n.leida ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {TIPO_ICON[n.tipo] ?? TIPO_ICON.sistema}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!n.leida ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                            {n.titulo}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{n.mensaje}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.fecha)}</p>
                        </div>
                        {!n.leida && (
                          <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {notifs.length > 0 && (
                  <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                    <button className="w-full text-xs text-center text-primary hover:underline font-medium">
                      Ver todas las notificaciones
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center space-x-3 focus:outline-none rounded-full p-1 pr-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-inner">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {user?.name || 'Administrador Demo'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 hidden sm:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50 p-2"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2 sm:hidden">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'Administrador Demo'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@universidad.edu'}</p>
                </div>

                <button
                  onClick={() => { navigate('/perfil'); setIsProfileOpen(false); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <User size={16} className="mr-3 text-gray-400" />
                  Mi Perfil
                </button>
                <button
                  onClick={() => { setShowSettingsModal(true); setIsProfileOpen(false); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <Settings size={16} className="mr-3 text-gray-400" />
                  Configurar Cuenta
                </button>

                <div className="h-px bg-gray-100 dark:border-gray-700 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <LogOut size={16} className="mr-3" />
                  Cerrar Sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </header>
  );
}
