import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, FileText, Loader2 } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { Button } from '../../components/ui/Button';
import Swal from 'sweetalert2';
import api from '../../api';
import { fetchSafe } from '../../api/fetchSafe';
import { MOCK } from '../../api/mock';
import { useRole } from '../../hooks/useRole';

export default function NotasPage() {
  const { isEstudiante: isStudent, isDocente } = useRole();

  const [courses, setCourses]         = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [grades, setGrades]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);

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
    if (!selectedCourse) { setGrades([]); return; }
    const loadGrades = async () => {
      setLoading(true);
      const data = await fetchSafe(api.get(`/notas?curso_id=${selectedCourse}`), MOCK.notas);
      setGrades(data);
      setLoading(false);
    };
    loadGrades();
  }, [selectedCourse]);

  const handleGradeChange = (estudianteId, field, value) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    if (num < 0)  num = 0;
    if (num > 20) num = 20;
    setGrades(prev =>
      prev.map(g => g.estudianteId === estudianteId ? { ...g, [field]: num } : g)
    );
  };

  const calcAvg = (g) =>
    Math.round((g.p1 * 0.15) + (g.p2 * 0.15) + (g.ep * 0.3) + (g.ef * 0.4));

  const gradeClass = (val) => {
    if (val >= 14) return 'text-primary font-bold dark:text-primary-400';
    if (val >= 11) return 'text-success font-bold';
    return 'text-destructive font-bold';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/notas', {
        curso_id: selectedCourse,
        grades: grades.map(g => ({
          estudianteId: g.estudianteId,
          p1: g.p1, p2: g.p2, ep: g.ep, ef: g.ef,
        })),
      });
      Swal.fire({ icon: 'success', title: 'Notas Guardadas', text: 'Las notas han sido actualizadas correctamente.', confirmButtonColor: '#1e3a8a' });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron guardar las notas.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setSaving(false);
    }
  };

  const FIELDS = [
    { key: 'p1', label: 'Práctica 1 (15%)' },
    { key: 'p2', label: 'Práctica 2 (15%)' },
    { key: 'ep', label: 'Parcial (30%)' },
    { key: 'ef', label: 'Final (40%)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="mr-3 text-primary" size={28} />
            Registro de Notas
          </h1>
          <p className="text-gray-500 mt-1">
            {isStudent ? 'Consulta tus calificaciones por curso.' : 'Ingresa y calcula los promedios de tus alumnos.'}
          </p>
        </motion.div>

        {!isStudent && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button onClick={handleSave} disabled={saving || !selectedCourse || grades.length === 0}>
              {saving
                ? <Loader2 size={18} className="mr-2 animate-spin" />
                : <Save size={18} className="mr-2" />}
              Guardar Cambios
            </Button>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-4">
          <label className="font-medium text-gray-700 dark:text-gray-300">Curso:</label>
          <select
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:ring-primary w-64"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Seleccionar curso --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !selectedCourse ? (
          <div className="text-center py-12 text-gray-400">Selecciona un curso para ver las notas.</div>
        ) : grades.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No hay estudiantes matriculados en este curso.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                {FIELDS.map(f => (
                  <TableHead key={f.key} className="w-28 text-center">{f.label}</TableHead>
                ))}
                <TableHead className="w-24 text-center">Promedio</TableHead>
                <TableHead className="w-28 text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {grades.map((student, i) => {
                const avg = calcAvg(student);
                return (
                  <motion.tr
                    key={student.estudianteId}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750"
                  >
                    <TableCell className="font-medium">{student.name}</TableCell>
                    {FIELDS.map(f => (
                      <TableCell key={f.key} className="text-center">
                        {isStudent ? (
                          <span className={`text-base ${gradeClass(student[f.key])}`}>{student[f.key]}</span>
                        ) : (
                          <input
                            type="number" min="0" max="20"
                            value={student[f.key]}
                            onChange={(e) => handleGradeChange(student.estudianteId, f.key, e.target.value)}
                            className={`w-16 text-center border rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-900 border-gray-200 dark:border-gray-600 ${gradeClass(student[f.key])}`}
                          />
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <div className={`text-lg px-3 py-1 rounded-lg inline-block shadow-sm
                        ${avg >= 14 ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300'
                          : avg >= 11 ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'}`}>
                        {avg < 10 ? `0${avg}` : avg}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full
                        ${avg >= 11 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {avg >= 11 ? 'Aprobado' : 'Desaprobado'}
                      </span>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
