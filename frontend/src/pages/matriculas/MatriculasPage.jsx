import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, BookOpen, User, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import Swal from 'sweetalert2';
import api from '../../api';
import { fetchSafe } from '../../api/fetchSafe';
import { MOCK } from '../../api/mock';
import { useRole } from '../../hooks/useRole';
import { useStore } from '../../context/useStore';

const STEPS = [
  { id: 1, title: 'Datos Personales', icon: User },
  { id: 2, title: 'Selección de Cursos', icon: BookOpen },
  { id: 3, title: 'Confirmación', icon: CreditCard },
];

export default function MatriculasPage() {
  const { isAdmin } = useRole();
  const { user } = useStore();

  const [currentStep, setCurrentStep]       = useState(1);
  const [cursos, setCursos]                 = useState([]);
  const [misMatriculas, setMisMatriculas]   = useState([]);
  const [selectedIds, setSelectedIds]       = useState([]);
  const [isLoadingCursos, setIsLoadingCursos] = useState(false);
  const [isLoadingMat, setIsLoadingMat]     = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  useEffect(() => {
    setIsLoadingCursos(true);
    fetchSafe(api.get('/cursos'), MOCK.cursos)
      .then(setCursos)
      .finally(() => setIsLoadingCursos(false));

    setIsLoadingMat(true);
    fetchSafe(api.get('/matriculas'), MOCK.matriculas)
      .then(setMisMatriculas)
      .finally(() => setIsLoadingMat(false));
  }, []);

  const enrolledCursoIds = new Set(misMatriculas.map((m) => m.curso_id));

  const toggleCurso = (id) => {
    if (enrolledCursoIds.has(id)) return; // ya matriculado
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedCursos = cursos.filter((c) => selectedIds.includes(c.id));
  const totalCredits   = selectedCursos.reduce((acc, c) => acc + c.credits, 0);

  const handleNext = () => {
    if (currentStep === 2 && selectedIds.length === 0) {
      Swal.fire({ icon: 'info', title: 'Selecciona al menos un curso', confirmButtonColor: '#1e3a8a' });
      return;
    }
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/matriculas', { curso_ids: selectedIds });
      const { enrolled, results } = res.data;
      const failed = results.filter((r) => !r.success);

      Swal.fire({
        icon: enrolled > 0 ? 'success' : 'warning',
        title: enrolled > 0 ? '¡Matrícula Exitosa!' : 'Sin cambios',
        html: enrolled > 0
          ? `Te matriculaste en <b>${enrolled}</b> curso(s) — <b>${totalCredits}</b> créditos.`
            + (failed.length > 0 ? `<br/><small>${failed.length} ya estaban registrados.</small>` : '')
          : 'Todos los cursos ya estaban registrados.',
        confirmButtonColor: '#1e3a8a',
        customClass: { popup: 'rounded-2xl' },
      }).then(() => {
        setCurrentStep(1);
        setSelectedIds([]);
        fetchSafe(api.get('/matriculas'), MOCK.matriculas).then(setMisMatriculas);
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo completar la matrícula.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = (matriculaId) => {
    Swal.fire({
      title: '¿Anular matrícula?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await api.delete(`/matriculas/${matriculaId}`);
        setMisMatriculas((prev) => prev.filter((m) => m.id !== matriculaId));
        Swal.fire({ icon: 'success', title: 'Matrícula anulada', showConfirmButton: false, timer: 1500 });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al anular.', confirmButtonColor: '#1e3a8a' });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proceso de Matrícula</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Ciclo Académico 2026-I</p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0 rounded-full" />
        <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
        <div className="relative z-10 flex justify-between">
          {STEPS.map((step) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                  ${done ? 'bg-primary text-white scale-95' : active ? 'bg-primary border-4 border-white dark:border-gray-900 text-white scale-110 shadow-lg' : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400'}`}>
                  {done ? <Check size={20} /> : <step.icon size={20} />}
                </div>
                <span className={`mt-3 text-sm font-medium transition-colors ${active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido del wizard */}
      <Card className="min-h-[400px] flex flex-col">
        <CardContent className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Datos personales */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verifica tus datos</h2>
                  <p className="text-gray-500 text-sm mt-1">Asegúrate de que tu información esté actualizada.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <input disabled value={user?.name?.split(' ')[0] || ''} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                    <input disabled value={user?.name?.split(' ').slice(1).join(' ') || ''} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo</label>
                    <input disabled value={user?.email || ''} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                    <input disabled value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} className="w-full bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Selección de cursos */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Selecciona tus cursos</h2>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    Créditos: {totalCredits}
                  </span>
                </div>
                {isLoadingCursos ? (
                  <div className="text-center py-8 text-gray-400">Cargando cursos disponibles...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cursos.map((curso) => {
                      const isEnrolled = enrolledCursoIds.has(curso.id);
                      const isSelected = selectedIds.includes(curso.id);
                      return (
                        <div key={curso.id} onClick={() => toggleCurso(curso.id)}
                          className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between
                            ${isEnrolled ? 'border-success/40 bg-success/5 cursor-not-allowed opacity-70'
                              : isSelected ? 'border-primary bg-primary/5 dark:bg-primary/10 cursor-pointer'
                              : 'border-gray-100 dark:border-gray-700 hover:border-primary/50 cursor-pointer'}`}
                        >
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{curso.name}</div>
                            <div className="text-sm text-gray-500">{curso.code} • {curso.credits} cr.</div>
                            {isEnrolled && <div className="text-xs text-success font-medium mt-1">Ya matriculado</div>}
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors
                            ${isEnrolled ? 'bg-success text-white' : isSelected ? 'bg-primary text-white' : 'border-2 border-gray-300 dark:border-gray-600'}`}>
                            {(isEnrolled || isSelected) && <Check size={14} />}
                          </div>
                        </div>
                      );
                    })}
                    {cursos.length === 0 && <div className="col-span-2 text-center py-8 text-gray-400">No hay cursos disponibles.</div>}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Confirmación */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} /></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen de Matrícula</h2>
                  <p className="text-gray-500 mt-1">Revisa que todo esté correcto antes de confirmar.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cursos Seleccionados</h3>
                  {selectedCursos.length === 0
                    ? <p className="text-gray-500 italic text-center py-4">No has seleccionado ningún curso.</p>
                    : (
                      <div className="space-y-3">
                        {selectedCursos.map((c) => (
                          <div key={c.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{c.code} — {c.name}</span>
                            <span className="text-gray-500">{c.credits} cr.</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-4 font-bold text-lg">
                          <span className="text-gray-900 dark:text-white">Total Créditos</span>
                          <span className="text-primary">{totalCredits}</span>
                        </div>
                      </div>
                    )
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
          <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)} disabled={currentStep === 1}>
            <ChevronLeft size={18} className="mr-2" /> Anterior
          </Button>
          {currentStep < 3
            ? <Button onClick={handleNext}>Siguiente <ChevronRight size={18} className="ml-2" /></Button>
            : <Button onClick={handleConfirm} disabled={selectedCursos.length === 0} isLoading={isSubmitting}>
                Confirmar Matrícula <Check size={18} className="ml-2" />
              </Button>
          }
        </div>
      </Card>

      {/* Mis matrículas actuales */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {isAdmin ? 'Todas las Matrículas' : 'Mis Matrículas'}
        </h2>
        {isLoadingMat ? (
          <div className="text-center py-8 text-gray-400">Cargando matrículas...</div>
        ) : misMatriculas.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No hay matrículas registradas.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Estudiante</TableHead>}
                <TableHead>Curso</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <tbody>
              {misMatriculas.map((m) => (
                <TableRow key={m.id}>
                  {isAdmin && <TableCell className="font-medium">{m.estudiante}</TableCell>}
                  <TableCell className="font-semibold text-gray-900 dark:text-white">{m.curso}</TableCell>
                  <TableCell className="text-primary font-medium">{m.codigo}</TableCell>
                  <TableCell>{m.creditos} cr.</TableCell>
                  <TableCell>
                    <Badge variant={m.estado === 'activo' ? 'success' : 'gray'}>
                      {m.estado.charAt(0).toUpperCase() + m.estado.slice(1)}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <button onClick={() => handleRemove(m.id)} className="text-xs text-destructive hover:underline font-medium">Anular</button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
