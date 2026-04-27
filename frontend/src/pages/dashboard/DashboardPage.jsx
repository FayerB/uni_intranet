import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../context/useStore';
import { Users, BookOpen, UserCheck, Newspaper } from 'lucide-react';
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Statistic } from '../../components/ui/Statistic';
import { ActivityFeed } from '../../components/ui/ActivityFeed';
import api from '../../api';

export default function DashboardPage() {
  const { user } = useStore();
  const [stats, setStats]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Defer chart render to after first browser paint so ResizeObserver
  // gets real dimensions instead of -1.
  useEffect(() => {
    if (!isLoading && stats) {
      const id = requestAnimationFrame(() => setChartReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isLoading, stats]);

  const rolCount = (rol) =>
    stats?.usuariosPorRol?.find((r) => r.rol === rol)?.cantidad ?? 0;

  const statCards = stats
    ? [
        {
          title: 'Total Usuarios',
          value: stats.totalUsuarios.toLocaleString(),
          icon: <Users className="text-primary" size={24} />,
          trend: { value: 0, isPositive: true },
        },
        {
          title: 'Docentes',
          value: rolCount('docente').toLocaleString(),
          icon: <UserCheck className="text-secondary" size={24} />,
          trend: { value: 0, isPositive: true },
        },
        {
          title: 'Estudiantes',
          value: rolCount('estudiante').toLocaleString(),
          icon: <BookOpen className="text-success" size={24} />,
          trend: { value: 0, isPositive: true },
        },
        {
          title: 'Noticias Publicadas',
          value: stats.noticiasPublicadas.toLocaleString(),
          icon: <Newspaper className="text-warning" size={24} />,
          trend: { value: 0, isPositive: true },
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Hola de nuevo, {user?.name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Aquí está el resumen general de la institución al día de hoy.
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <Statistic key={stat.title} index={idx} {...stat} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Actividad últimos 6 meses
              </h3>
              <div className="h-72" translate="no">
                {chartReady && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.chartData ?? []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorNoticias" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1e3a8a" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                      <Tooltip
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: '500' }}
                      />
                      <Area type="monotone" dataKey="noticias" name="Noticias" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorNoticias)" />
                      <Area type="monotone" dataKey="usuarios" name="Usuarios" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorUsuarios)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                {!chartReady && (
                  <div className="h-full bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-pulse" />
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  );
}
