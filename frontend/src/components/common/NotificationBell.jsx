import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import useNotifications from '../../hooks/useNotifications';

const TIPO_COLOR = {
  info:         'bg-blue-100 text-blue-700',
  tarea:        'bg-amber-100 text-amber-700',
  examen:       'bg-red-100 text-red-700',
  calificacion: 'bg-green-100 text-green-700',
  mensaje:      'bg-purple-100 text-purple-700',
  alerta:       'bg-orange-100 text-orange-700',
  sistema:      'bg-gray-100 text-gray-700',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notificaciones, count, marcarLeida, marcarTodas } = useNotifications();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-premium border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                Notificaciones {count > 0 && <span className="text-xs text-blue-600">({count} nuevas)</span>}
              </span>
              <div className="flex gap-1">
                {count > 0 && (
                  <button
                    onClick={marcarTodas}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck size={15} className="text-gray-500" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={15} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
              {notificaciones.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Sin notificaciones</p>
              ) : (
                notificaciones.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.leida) marcarLeida(n.id); }}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                      !n.leida ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${TIPO_COLOR[n.tipo] || TIPO_COLOR.info}`}>
                        {n.tipo}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.titulo}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.mensaje}</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                      {!n.leida && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
