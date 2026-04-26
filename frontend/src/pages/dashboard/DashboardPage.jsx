import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../context/useStore';
import { Users, BookOpen, CalendarDays, GraduationCap } from 'lucide-react';
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Statistic } from '../../components/ui/Statistic';
import { ActivityFeed } from '../../components/ui/ActivityFeed';

export default function DashboardPage() {
  const { user } = useStore();

  const stats = [
    { title: 'Estudiantes Activos', value: '4,245', icon: <Users className="text-primary" size={24} />, trend: { value: 12.5, isPositive: true } },
    { title: 'Cursos Dictados', value: '184', icon: <BookOpen className="text-secondary" size={24} />, trend: { value: 3.2, isPositive: true } },
    { title: 'Nuevas Matrículas', value: '892', icon: <GraduationCap className="text-success" size={24} />, trend: { value: 5.1, isPositive: true } },
    { title: 'Eventos del Mes', value: '12', icon: <CalendarDays className="text-warning" size={24} />, trend: { value: 2, isPositive: false } },
  ];

  const [timeRange, setTimeRange] = useState('Mes');

  const enrollmentDataMes = [
    { name: 'Ene', matriculados: 4000, graduados: 2400 },
    { name: 'Feb', matriculados: 3000, graduados: 1398 },
    { name: 'Mar', matriculados: 2000, graduados: 9800 },
    { name: 'Abr', matriculados: 2780, graduados: 3908 },
    { name: 'May', matriculados: 1890, graduados: 4800 },
    { name: 'Jun', matriculados: 2390, graduados: 3800 },
    { name: 'Jul', matriculados: 3490, graduados: 4300 },
  ];

  const enrollmentDataSemana = [
    { name: 'Lun', matriculados: 120, graduados: 40 },
    { name: 'Mar', matriculados: 200, graduados: 80 },
    { name: 'Mié', matriculados: 150, graduados: 120 },
    { name: 'Jue', matriculados: 280, graduados: 60 },
    { name: 'Vie', matriculados: 90, graduados: 300 },
    { name: 'Sáb', matriculados: 40, graduados: 10 },
    { name: 'Dom', matriculados: 10, graduados: 5 },
  ];

  const chartData = timeRange === 'Mes' ? enrollmentDataMes : enrollmentDataSemana;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Hola de nuevo, {user?.name?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Aquí está el resumen general de la institución al día de hoy.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setTimeRange('Mes')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${timeRange === 'Mes' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Mes
            </button>
            <button 
              onClick={() => setTimeRange('Semana')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${timeRange === 'Semana' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Semana
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Statistic key={stat.title} index={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="lg:col-span-2">
          <Card className="h-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Tendencia de Estudiantes</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMatriculados" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGraduados" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#1e3a8a', fontWeight: '500' }}
                    />
                    <Area type="monotone" dataKey="matriculados" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorMatriculados)" />
                    <Area type="monotone" dataKey="graduados" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorGraduados)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="lg:col-span-1">
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  );
}
