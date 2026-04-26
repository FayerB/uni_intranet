import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { Card, CardContent } from '../../components/ui/Card';
import { useAttendance } from '../../hooks/useAttendance';

export default function AsistenciaPage() {
  const { 
    currentDate, alumnos, stats, isLoading, 
    markAttendance, markAll, changeDate 
  } = useAttendance();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <CalendarClock className="mr-3 text-secondary" size={28} />
            Toma de Asistencia
          </h1>
          <p className="text-gray-500 mt-1">Registra la asistencia del día para el curso actual.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 relative">
          <input 
            type="date"
            value={currentDate}
            onChange={(e) => changeDate(e.target.value)}
            className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-gray-500 mb-1">Total Alumnos</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-gray-500 mb-1">Presentes</span>
            <span className="text-3xl font-bold text-success">{stats.presentes}</span>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-gray-500 mb-1">Tardanzas</span>
            <span className="text-3xl font-bold text-warning">{stats.tardanzas}</span>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-gray-500 mb-1">Faltas</span>
            <span className="text-3xl font-bold text-destructive">{stats.faltas}</span>
          </CardContent>
        </Card>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}
        <div className="flex justify-end gap-2 mb-4">
          <button onClick={() => markAll('presente')} className="px-3 py-1.5 text-sm bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors">Marcar todos Presente</button>
          <button onClick={() => markAll('falta')} className="px-3 py-1.5 text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors">Marcar todos Falta</button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead className="text-center w-64">Acciones de Asistencia</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {alumnos.map((alumno) => (
              <TableRow key={alumno.id}>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">{alumno.name}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => markAttendance(alumno.id, 'presente')}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2 
                        ${alumno.status === 'presente' ? 'bg-success/10 border-success text-success' : 'border-transparent text-gray-400 hover:text-success hover:bg-success/5'}`}
                    >
                      <CheckCircle size={24} />
                      <span className="text-[10px] uppercase font-bold mt-1">Presente</span>
                    </button>
                    <button 
                      onClick={() => markAttendance(alumno.id, 'tardanza')}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2 
                        ${alumno.status === 'tardanza' ? 'bg-warning/10 border-warning text-warning' : 'border-transparent text-gray-400 hover:text-warning hover:bg-warning/5'}`}
                    >
                      <Clock size={24} />
                      <span className="text-[10px] uppercase font-bold mt-1">Tardanza</span>
                    </button>
                    <button 
                      onClick={() => markAttendance(alumno.id, 'falta')}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2 
                        ${alumno.status === 'falta' ? 'bg-destructive/10 border-destructive text-destructive' : 'border-transparent text-gray-400 hover:text-destructive hover:bg-destructive/5'}`}
                    >
                      <XCircle size={24} />
                      <span className="text-[10px] uppercase font-bold mt-1">Falta</span>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </motion.div>
    </div>
  );
}
