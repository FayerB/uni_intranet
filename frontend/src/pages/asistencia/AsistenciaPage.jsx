import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle, XCircle, Clock, Loader2, Save } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Swal from 'sweetalert2';
import api from '../../api';
import { fetchSafe } from '../../api/fetchSafe';
import { MOCK } from '../../api/mock';
import { useRole } from '../../hooks/useRole';

export default function AsistenciaPage() {
  const { isEstudiante: isStudent, isDocente } = useRole();
  const today = new Date().toISOString().split('T')[0];

  const [courses, setCourses]               = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [currentDate, setCurrentDate]       = useState(today);
  const [alumnos, setAlumnos]               = useState([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [saving, setSaving]                 = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      if (isStudent) {
        const data = await fetchSafe(api.get('/matriculas'), MOCK.matriculas);
        setCourses(data.map(m => ({ id: m.curso_id, name: m.curso })));
      } else {
        const data = await fetchSafe(api.get('/cursos'), MOCK.cursos);
        if (isDocente) {
          // Si el docente no tiene cursos asignados aún, mostrar todos (backend incompleto)
          const myCourses = data.filter(c => c.docente_id != null);
          setCourses((myCourses.length > 0 ? myCourses : data).map(c => ({ id: c.id, name: c.name })));
        } else {
          setCourses(data.map(c => ({ id: c.id, name: c.name })));
        }
      }
    };
    loadCourses();
  }, [isStudent, isDocente]);

  useEffect(() => {
    if (!selectedCourse) { setAlumnos([]); return; }
    const loadAttendance = async () => {
      setIsLoading(true);
      const data = await fetchSafe(
        api.get(`/asistencias?curso_id=${selectedCourse}&fecha=${currentDate}`),
        MOCK.asistencias
      );
      setAlumnos(data.map(a => ({ ...a, status: a.estado })));
      setIsLoading(false);
    };
    loadAttendance();
  }, [selectedCourse, currentDate]);

  const markAttendance = (estudianteId, status) => {
    setAlumnos(prev => prev.map(a => a.estudianteId === estudianteId ? { ...a, status } : a));
  };

  const markAll = (status) => {
    setAlumnos(prev => prev.map(a => ({ ...a, status })));
  };

  const handleSave = async () => {
    const records = alumnos.filter(a => a.status !== null);
    if (records.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin cambios', text: 'Marca la asistencia de al menos un alumno.', confirmButtonColor: '#1e3a8a' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/asistencias', {
        curso_id: selectedCourse,
        fecha: currentDate,
        records: records.map(a => ({ estudianteId: a.estudianteId, estado: a.status })),
      });
      Swal.fire({ icon: 'success', title: 'Asistencia Guardada', text: 'El registro ha sido actualizado correctamente.', confirmButtonColor: '#1e3a8a' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la asistencia.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total:     alumnos.length,
    presentes: alumnos.filter(a => a.status === 'presente').length,
    tardanzas: alumnos.filter(a => a.status === 'tardanza').length,
    faltas:    alumnos.filter(a => a.status === 'falta').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <CalendarClock className="mr-3 text-secondary" size={28} />
            {isStudent ? 'Mi Asistencia' : 'Toma de Asistencia'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isStudent
              ? 'Consulta tu historial de asistencia por curso y fecha.'
              : 'Registra la asistencia del día para el curso seleccionado.'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 items-center">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
          />
          {!isStudent && (
            <Button onClick={handleSave} disabled={saving || !selectedCourse}>
              {saving
                ? <Loader2 size={18} className="mr-2 animate-spin" />
                : <Save size={18} className="mr-2" />}
              Guardar
            </Button>
          )}
        </motion.div>
      </div>

      {/* Course selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4"
      >
        <label className="font-medium text-gray-700 dark:text-gray-300">Curso:</label>
        <select
          className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:ring-primary w-64"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Seleccionar curso --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </motion.div>

      {/* Stats cards */}
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

      {/* Attendance table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {!isStudent && alumnos.length > 0 && (
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={() => markAll('presente')}
              className="px-3 py-1.5 text-sm bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors"
            >
              Marcar todos Presente
            </button>
            <button
              onClick={() => markAll('falta')}
              className="px-3 py-1.5 text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
            >
              Marcar todos Falta
            </button>
          </div>
        )}

        {!selectedCourse ? (
          <div className="text-center py-12 text-gray-400">Selecciona un curso para ver la asistencia.</div>
        ) : alumnos.length === 0 && !isLoading ? (
          <div className="text-center py-12 text-gray-400">No hay estudiantes matriculados en este curso.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead className="text-center w-64">
                  {isStudent ? 'Estado' : 'Acciones de Asistencia'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {alumnos.map((alumno) => (
                <TableRow key={alumno.estudianteId}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {alumno.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {isStudent ? (
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        alumno.status === 'presente'  ? 'bg-success/10 text-success' :
                        alumno.status === 'tardanza'  ? 'bg-warning/10 text-warning' :
                        alumno.status === 'falta'     ? 'bg-destructive/10 text-destructive' :
                        'bg-gray-100 text-gray-400 dark:bg-gray-700'
                      }`}>
                        {alumno.status
                          ? alumno.status.charAt(0).toUpperCase() + alumno.status.slice(1)
                          : 'Sin registrar'}
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => markAttendance(alumno.estudianteId, 'presente')}
                          className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2
                            ${alumno.status === 'presente'
                              ? 'bg-success/10 border-success text-success'
                              : 'border-transparent text-gray-400 hover:text-success hover:bg-success/5'}`}
                        >
                          <CheckCircle size={24} />
                          <span className="text-[10px] uppercase font-bold mt-1">Presente</span>
                        </button>
                        <button
                          onClick={() => markAttendance(alumno.estudianteId, 'tardanza')}
                          className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2
                            ${alumno.status === 'tardanza'
                              ? 'bg-warning/10 border-warning text-warning'
                              : 'border-transparent text-gray-400 hover:text-warning hover:bg-warning/5'}`}
                        >
                          <Clock size={24} />
                          <span className="text-[10px] uppercase font-bold mt-1">Tardanza</span>
                        </button>
                        <button
                          onClick={() => markAttendance(alumno.estudianteId, 'falta')}
                          className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2
                            ${alumno.status === 'falta'
                              ? 'bg-destructive/10 border-destructive text-destructive'
                              : 'border-transparent text-gray-400 hover:text-destructive hover:bg-destructive/5'}`}
                        >
                          <XCircle size={24} />
                          <span className="text-[10px] uppercase font-bold mt-1">Falta</span>
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
