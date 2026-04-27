import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Search, BookOpen, Clock, Users, ArrowRight, Plus, Edit2, Trash2, X, CheckCircle, Presentation } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../../api';
import { useStore } from '../../context/useStore';

const TIPOS = ['Obligatorio', 'Electivo', 'Especialidad'];
const CICLOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const typeBadge = (t) => t === 'Obligatorio' ? 'primary' : t === 'Electivo' ? 'warning' : 'secondary';

export default function CursosPage() {
  const { user } = useStore();
  const canWrite = user?.role === 'admin' || user?.role === 'docente';
  const canDelete = user?.role === 'admin';

  const [cursos, setCursos]           = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [viewMode, setViewMode]       = useState('grid');
  const [searchTerm, setSearchTerm]   = useState('');
  const [cicloFilter, setCicloFilter] = useState('Todos');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [isSaving, setIsSaving]       = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchCursos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (cicloFilter !== 'Todos') params.ciclo = cicloFilter;
      const res = await api.get('/cursos', { params });
      setCursos(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los cursos.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, cicloFilter]);

  useEffect(() => { fetchCursos(); }, [fetchCursos]);

  const openForm = (curso = null) => {
    setEditingCurso(curso);
    reset(curso
      ? { codigo: curso.code, nombre: curso.name, descripcion: curso.description, creditos: curso.credits, ciclo: curso.ciclo, tipo: curso.type, imagen_url: curso.image || '' }
      : { codigo: '', nombre: '', descripcion: '', creditos: 3, ciclo: 'I', tipo: 'Obligatorio', imagen_url: '' }
    );
    setIsFormOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editingCurso) {
        await api.put(`/cursos/${editingCurso.id}`, data);
      } else {
        await api.post('/cursos', data);
      }
      Swal.fire({ icon: 'success', title: editingCurso ? 'Curso actualizado' : 'Curso creado', showConfirmButton: false, timer: 1500 });
      setIsFormOpen(false);
      fetchCursos();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al guardar.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (curso) => {
    Swal.fire({
      title: `¿Desactivar "${curso.name}"?`,
      text: 'Los estudiantes matriculados no se verán afectados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await api.delete(`/cursos/${curso.id}`);
        Swal.fire({ icon: 'success', title: 'Curso desactivado', showConfirmButton: false, timer: 1500 });
        fetchCursos();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al desactivar.', confirmButtonColor: '#1e3a8a' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cursos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Explora y gestiona los cursos académicos.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
          {canWrite && (
            <Button onClick={() => openForm()}>
              <Plus size={16} className="mr-1" /> Nuevo Curso
            </Button>
          )}
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}><List size={18} /></button>
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1">
          <Input placeholder="Buscar por código o nombre..." icon={Search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select
          className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-48"
          value={cicloFilter} onChange={(e) => setCicloFilter(e.target.value)}
        >
          <option value="Todos">Todos los ciclos</option>
          {CICLOS.map((c) => <option key={c} value={c}>Ciclo {c}</option>)}
        </select>
      </motion.div>

      {/* Contenido */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Cargando cursos...</div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {cursos.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                  <p className="text-gray-500 dark:text-gray-400">No se encontraron cursos.</p>
                </div>
              )}
              {cursos.map((curso, i) => (
                <motion.div key={curso.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card hover className="h-full flex flex-col group">
                    <div className="h-48 overflow-hidden rounded-t-2xl relative">
                      {curso.image
                        ? <img src={curso.image} alt={curso.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                        : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"><BookOpen size={40} className="text-primary/40" /></div>
                      }
                      <div className="absolute top-3 left-3">
                        <Badge variant={typeBadge(curso.type)}>{curso.type}</Badge>
                      </div>
                      {(canWrite || canDelete) && (
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canWrite && <button onClick={(e) => { e.stopPropagation(); openForm(curso); }} className="p-1.5 bg-white/90 rounded-lg text-primary hover:bg-white shadow"><Edit2 size={14} /></button>}
                          {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDelete(curso); }} className="p-1.5 bg-white/90 rounded-lg text-destructive hover:bg-white shadow"><Trash2 size={14} /></button>}
                        </div>
                      )}
                    </div>
                    <CardContent className="flex-1 flex flex-col p-5">
                      <div className="text-xs font-semibold text-primary mb-2">{curso.code}</div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">{curso.name}</h3>
                      <div className="mt-auto space-y-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><BookOpen size={16} className="mr-2" />{curso.credits} Créditos</div>
                        {curso.ciclo && <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Clock size={16} className="mr-2" />Ciclo {curso.ciclo}</div>}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400"><Users size={16} className="mr-2" />{curso.students} Estudiantes</div>
                      </div>
                      <button onClick={() => setSelectedCourse(curso)} className="mt-4 flex items-center justify-between text-sm font-medium text-primary hover:text-primary-600 transition-colors w-full">
                        Ver detalles <ArrowRight size={16} />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Créditos</TableHead>
                    <TableHead className="text-right">Alumnos</TableHead>
                    {(canWrite || canDelete) && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <tbody>
                  {cursos.map((curso, i) => (
                    <motion.tr key={curso.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <TableCell className="font-medium text-primary">{curso.code}</TableCell>
                      <TableCell><span className="font-semibold text-gray-900 dark:text-white">{curso.name}</span></TableCell>
                      <TableCell>{curso.ciclo ? `Ciclo ${curso.ciclo}` : '—'}</TableCell>
                      <TableCell><Badge variant={typeBadge(curso.type)}>{curso.type}</Badge></TableCell>
                      <TableCell>{curso.credits}</TableCell>
                      <TableCell className="text-right font-medium">{curso.students}</TableCell>
                      {(canWrite || canDelete) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canWrite && <button onClick={() => openForm(curso)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit2 size={16} /></button>}
                            {canDelete && <button onClick={() => handleDelete(curso)} className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={16} /></button>}
                          </div>
                        </TableCell>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </Table>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Modal detalle */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCourse(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-48 relative shrink-0">
                {selectedCourse.image
                  ? <img src={selectedCourse.image} alt={selectedCourse.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <button onClick={() => setSelectedCourse(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"><X size={20} /></button>
                <div className="absolute bottom-4 left-6 pr-6">
                  <Badge variant={typeBadge(selectedCourse.type)} className="mb-2 shadow-lg backdrop-blur-md bg-white/20 border-white/10 text-white">{selectedCourse.type}</Badge>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedCourse.name}</h2>
                  <p className="text-white/80 font-medium">{selectedCourse.code}</p>
                </div>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl flex flex-col items-center">
                    <BookOpen className="text-primary mb-2" size={24} />
                    <span className="text-sm text-gray-500">Créditos</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedCourse.credits} pts</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl flex flex-col items-center">
                    <Clock className="text-secondary mb-2" size={24} />
                    <span className="text-sm text-gray-500">Ciclo</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedCourse.ciclo || '—'}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl flex flex-col items-center">
                    <Users className="text-success mb-2" size={24} />
                    <span className="text-sm text-gray-500">Alumnos</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedCourse.students} inscritos</span>
                  </div>
                </div>
                {selectedCourse.description && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Descripción</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{selectedCourse.description}</p>
                  </div>
                )}
                {selectedCourse.docente && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Docente</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="text-success" size={16} />
                      {selectedCourse.docente}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Sílabo General</h3>
                  <div className="space-y-3">
                    <div className="flex items-start"><CheckCircle className="text-success mt-0.5 mr-3 shrink-0" size={18} /><p className="text-gray-600 dark:text-gray-300 text-sm">Fundamentos teóricos y conceptualización general de las bases metodológicas.</p></div>
                    <div className="flex items-start"><CheckCircle className="text-success mt-0.5 mr-3 shrink-0" size={18} /><p className="text-gray-600 dark:text-gray-300 text-sm">Desarrollo de proyectos colaborativos en el entorno digital de aprendizaje.</p></div>
                    <div className="flex items-start"><Presentation className="text-gray-400 mt-0.5 mr-3 shrink-0" size={18} /><p className="text-gray-500 dark:text-gray-400 text-sm">Exposición final de sustento y resultados de experimentación.</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal crear/editar */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingCurso ? 'Editar Curso' : 'Nuevo Curso'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Código</label>
              <Input {...register('codigo', { required: 'Requerido' })} placeholder="CS101" error={errors.codigo} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre</label>
              <Input {...register('nombre', { required: 'Requerido' })} placeholder="Intro a la Programación" error={errors.nombre} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Descripción</label>
            <textarea {...register('descripcion')} rows={2} placeholder="Descripción del curso..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Créditos</label>
              <Input {...register('creditos', { valueAsNumber: true })} type="number" min={1} max={10} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Ciclo</label>
              <select {...register('ciclo')} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary">
                {CICLOS.map((c) => <option key={c} value={c}>Ciclo {c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <select {...register('tipo')} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary">
                {TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">URL de imagen</label>
            <Input {...register('imagen_url')} placeholder="https://..." />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
