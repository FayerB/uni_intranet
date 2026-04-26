import { motion } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'success',
    title: 'Nuevas matrículas registradas',
    desc: 'Se han procesado 45 matrículas para el ciclo 2026-I.',
    time: 'Hace 2 horas',
    icon: CheckCircle2,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Actualización de sistema pendiente',
    desc: 'Mantenimiento programado para el servidor principal.',
    time: 'Hace 5 horas',
    icon: AlertCircle,
  },
  {
    id: 3,
    type: 'info',
    title: 'Nuevo comentario en curso de BD',
    desc: 'El docente Carlos Ruíz publicó un aviso.',
    time: 'Ayer',
    icon: MessageCircle,
  },
];

export function ActivityFeed() {
  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-success bg-success/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'info': return 'text-primary bg-primary/10';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Actividad Reciente
      </h3>
      
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <motion.div 
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="flex relative"
          >
            {index !== activities.length - 1 && (
              <div className="absolute top-10 bottom-[-24px] left-5 w-px bg-gray-200 dark:bg-gray-700"></div>
            )}
            
            <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${getIconColor(activity.type)}`}>
              <activity.icon size={20} />
            </div>
            
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {activity.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activity.desc}
              </p>
              <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                <Clock size={12} className="mr-1" />
                {activity.time}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-colors">
        Ver todo el historial
      </button>
    </div>
  );
}
