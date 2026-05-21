import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, BookOpen, Plus, Trash2, Search, UsersRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import Swal from 'sweetalert2';
import api from '../../api';
import { fetchSafe } from '../../api/fetchSafe';
import { MOCK } from '../../api/mock';
import { useRole } from '../../hooks/useRole';

// ── Vista Admin ───────────────────────────────────────────────────────────────
function AdminMatriculasView() {
  const [students, setStudents]         = useState([]);
  const [cursos, setCursos]             = useState([]);
  const [matriculas, setMatriculas]     = useState([]);
  const [selEstudiante, setSelEstudiante] = useState('');
  const [selCurso, setSelCurso]         = useState('');
  const [isSaving, setIsSaving]         = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [gradoFilter, setGradoFilter]   = useState('Todos');

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    const [studentsRes, cursosRes, matRes] = await Promise.all([
      fetchSafe(api.get('/usuarios?role=estudiante'), []),
      fetchSafe(api.get('/cursos'), MOCK.cursos),
      fetchSafe(api.get('/matriculas'), MOCK.matriculas),
    ]);
    setStudents(studentsRes);
    setCursos(cursosRes);
    setMatriculas(matRes);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleEnroll = async () => {
    if (!selEstudiante || !selCurso) {
      Swal.fire({ icon: 'warning', title: 'Selecciona estudiante y curso', confirmButtonColor: '#1e3a8a' });
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/matriculas', { curso_ids: [selCurso], estudiante_id: selEstudiante });
      Swal.fire({ icon: 'success', title: 'Matrícula registrada', showConfirmButton: false, timer: 1500 });
      setSelEstudiante('');
      setSelCurso('');
      loadAll();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo matricular.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = (id) => {
    Swal.fire({
      title: '¿Anular matrícula?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return;
      try {
        await api.delete(`/matriculas/${id}`);
        setMatriculas((prev) => prev.filter((m) => m.id !== id));
        Swal.fire({ icon: 'success', title: 'Matrícula anulada', showConfirmButton: false, timer: 1500 });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al anular.', confirmButtonColor: '#1e3a8a' });
      }
    });
  };

  const filtered = matriculas.filter((m) => {
    const matchSearch = !searchTerm ||
      m.estudiante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.curso?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrado = gradoFilter === 'Todos' || m.codigo?.includes(`-${gradoFilter.replace('°', '')}`);
    return matchSearch && matchGrado;
  });

  const gradoOptions = ['Todos', '1°', '2°', '3°', '4°', '5°'];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <UsersRound className="text-primary" size={28} />
          Gestión de Matrículas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Registra, consulta y anula matrículas de estudiantes.</p>
      </motion.div>

      {/* Formulario nueva matrícula */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus size={20} className="text-primary" /> Nueva Matrícula
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estudiante</label>
                <select
                  value={selEstudiante}
                  onChange={(e) => setSelEstudiante(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Seleccionar estudiante --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} {s.apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Curso</label>
                <select
                  value={selCurso}
                  onChange={(e) => setSelCurso(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Seleccionar curso --</option>
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.grado ? `(${c.grado}"${c.seccion}")` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={handleEnroll} isLoading={isSaving}>
                  <Plus size={16} className="mr-2" /> Matricular
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filtros tabla */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1">
          <Input placeholder="Buscar por estudiante o curso..." icon={Search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select
          value={gradoFilter}
          onChange={(e) => setGradoFilter(e.target.value)}
          className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:ring-primary w-full md:w-44"
        >
          {gradoOptions.map((g) => <option key={g} value={g}>{g === 'Todos' ? 'Todos los grados' : `${g} Grado`}</option>)}
        </select>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl">
          <span className="text-sm font-semibold text-primary">{filtered.length}</span>
          <span className="text-xs text-gray-500">matrículas</span>
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Cargando matrículas...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">No se encontraron matrículas.</td>
                </tr>
              ) : (
                filtered.map((m, i) => (
                  <motion.tr key={m.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-white">{m.estudiante}</TableCell>
                    <TableCell>{m.curso}</TableCell>
                    <TableCell className="font-mono text-xs text-primary">{m.codigo}</TableCell>
                    <TableCell>
                      <Badge variant={m.estado === 'activo' ? 'success' : 'gray'}>
                        {m.estado.charAt(0).toUpperCase() + m.estado.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => handleRemove(m.id)}
                        className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}

// ── Vista Estudiante: solo lectura ────────────────────────────────────────────
function EstudianteMatriculasView() {
  const [misMatriculas, setMisMatriculas] = useState([]);
  const [isLoading, setIsLoading]         = useState(true);

  useEffect(() => {
    fetchSafe(api.get('/matriculas'), MOCK.matriculas)
      .then(setMisMatriculas)
      .finally(() => setIsLoading(false));
  }, []);

  const totalHoras = misMatriculas.reduce((acc, m) => acc + (m.creditos ?? 0), 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="text-primary" size={28} />
          Mis Cursos
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Cursos asignados por la Secretaría Académica para el Año Escolar 2025.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Cargando tus cursos...</div>
      ) : misMatriculas.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aún no tienes cursos asignados.</p>
            <p className="text-sm mt-1">Comunícate con la Secretaría Académica.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resumen */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <BookOpen size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{misMatriculas.length}</p>
                  <p className="text-xs text-gray-500">Cursos asignados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <Check size={20} className="text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHoras}</p>
                  <p className="text-xs text-gray-500">Horas semanales</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-xl">
                  <UsersRound size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {misMatriculas.filter(m => m.estado === 'activo').length}
                  </p>
                  <p className="text-xs text-gray-500">Activos</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabla */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Área Curricular</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Hrs/sem.</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {misMatriculas.map((m, i) => (
                  <motion.tr key={m.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04 }}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-750"
                  >
                    <TableCell className="font-semibold text-gray-900 dark:text-white">{m.curso}</TableCell>
                    <TableCell className="font-mono text-xs text-primary">{m.codigo}</TableCell>
                    <TableCell className="text-gray-500">{m.creditos ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={m.estado === 'activo' ? 'success' : 'gray'}>
                        {m.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </tbody>
            </Table>
          </motion.div>
        </>
      )}
    </div>
  );
}

// ── Docente: vista informativa ─────────────────────────────────────────────────
function DocenteMatriculasView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen size={40} className="text-primary" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Matrículas de tus cursos</h2>
      <p className="text-gray-500 max-w-sm">
        Los estudiantes matriculados en tus cursos aparecen automáticamente en las secciones de <strong>Notas</strong> y <strong>Asistencia</strong>.
      </p>
    </div>
  );
}

// ── Router por rol ─────────────────────────────────────────────────────────────
export default function MatriculasPage() {
  const { isAdmin, isDocente } = useRole();

  if (isAdmin)   return <AdminMatriculasView />;
  if (isDocente) return <DocenteMatriculasView />;
  return <EstudianteMatriculasView />;
}
