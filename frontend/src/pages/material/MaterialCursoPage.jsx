import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookMarked, Plus, Trash2, FileText, Video, Link, File, Filter, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useRole } from '../../hooks/useRole';
import { materialesAPI } from '../../api/materiales';
import { fetchSafe } from '../../api/fetchSafe';
import api from '../../api';
import { MOCK } from '../../api/mock';
import Swal from 'sweetalert2';

const TIPO_ICON = {
  pdf:   <FileText size={20} className="text-red-500" />,
  video: <Video size={20} className="text-purple-500" />,
  link:  <Link size={20} className="text-blue-500" />,
  doc:   <File size={20} className="text-indigo-500" />,
};

const TIPO_BADGE = {
  pdf:   'destructive',
  video: 'secondary',
  link:  'primary',
  doc:   'gray',
};

function MaterialCard({ m, canDelete, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow group"
    >
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl shrink-0">
        {TIPO_ICON[m.tipo] ?? TIPO_ICON.doc}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{m.titulo}</p>
          <Badge variant={TIPO_BADGE[m.tipo] || 'gray'} className="shrink-0 text-[10px]">
            {m.tipo.toUpperCase()}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-1">{m.docente} · {m.fecha}{m.tamaño ? ` · ${m.tamaño}` : ''}</p>
        <a
          href={m.enlace}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-medium text-primary hover:underline"
        >
          {m.tipo === 'link' || m.tipo === 'video' ? 'Abrir enlace →' : 'Descargar →'}
        </a>
      </div>
      {canDelete && (
        <button
          onClick={() => onDelete(m.id)}
          className="opacity-0 group-hover:opacity-100 p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all shrink-0"
        >
          <Trash2 size={16} />
        </button>
      )}
    </motion.div>
  );
}

export default function MaterialCursoPage() {
  const { isAdmin, isDocente } = useRole();
  const canManage = isAdmin || isDocente;

  const [materiales, setMateriales]     = useState([]);
  const [cursos, setCursos]             = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [cursoFilter, setCursoFilter]   = useState('todos');
  const [tipoFilter, setTipoFilter]     = useState('todos');
  const [search, setSearch]             = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm] = useState({ curso_id: '', titulo: '', tipo: 'pdf', enlace: '', tamaño: '' });

  useEffect(() => {
    Promise.all([
      materialesAPI.getAll(),
      fetchSafe(api.get('/cursos'), MOCK.cursos),
    ]).then(([mats, curs]) => {
      setMateriales(mats);
      setCursos(curs);
    }).finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return materiales.filter((m) => {
      const byCurso = cursoFilter === 'todos' || m.curso_id === Number(cursoFilter);
      const byTipo  = tipoFilter  === 'todos' || m.tipo === tipoFilter;
      const bySearch = !search || m.titulo.toLowerCase().includes(search.toLowerCase()) || m.docente?.toLowerCase().includes(search.toLowerCase());
      return byCurso && byTipo && bySearch;
    });
  }, [materiales, cursoFilter, tipoFilter, search]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar material?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    await materialesAPI.remove(id).catch(() => {});
    setMateriales((prev) => prev.filter((m) => m.id !== id));
    Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.curso_id || !form.titulo || !form.enlace) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa curso, título y enlace.', confirmButtonColor: '#1e3a8a' });
      return;
    }
    const curso = cursos.find((c) => c.id === Number(form.curso_id));
    const nuevo = {
      id: Date.now(),
      curso_id: Number(form.curso_id),
      titulo: form.titulo,
      tipo: form.tipo,
      enlace: form.enlace,
      tamaño: form.tamaño || null,
      fecha: new Date().toISOString().slice(0, 10),
      docente: curso?.docente || 'Docente',
    };
    await materialesAPI.create(form).catch(() => {});
    setMateriales((prev) => [nuevo, ...prev]);
    setForm({ curso_id: '', titulo: '', tipo: 'pdf', enlace: '', tamaño: '' });
    setShowForm(false);
    Swal.fire({ icon: 'success', title: 'Material agregado', timer: 1500, showConfirmButton: false });
  };

  const cursosConMaterial = useMemo(() => {
    const ids = [...new Set(materiales.map((m) => m.curso_id))];
    return cursos.filter((c) => ids.includes(c.id));
  }, [materiales, cursos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookMarked className="mr-3 text-primary" size={28} />
            Material de Curso
          </h1>
          <p className="text-gray-500 mt-1">Recursos académicos organizados por asignatura.</p>
        </motion.div>
        {canManage && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus size={16} className="mr-2" />
            Agregar Material
          </Button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
                Nuevo Material
              </div>
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Curso *</label>
                    <select
                      value={form.curso_id}
                      onChange={(e) => setForm({ ...form, curso_id: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:ring-primary focus:border-primary"
                    >
                      <option value="">Selecciona un curso</option>
                      {cursos.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Título *</label>
                    <input
                      type="text"
                      value={form.titulo}
                      onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                      placeholder="Nombre del material"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Tipo</label>
                    <select
                      value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:ring-primary focus:border-primary"
                    >
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="link">Enlace</option>
                      <option value="doc">Documento</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Enlace / URL *</label>
                    <input
                      type="url"
                      value={form.enlace}
                      onChange={(e) => setForm({ ...form, enlace: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Tamaño (opcional)</label>
                    <input
                      type="text"
                      value={form.tamaño}
                      onChange={(e) => setForm({ ...form, tamaño: e.target.value })}
                      placeholder="Ej: 2.3 MB"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button type="submit" className="flex-1">Guardar</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título o docente..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400 shrink-0" />
              <select
                value={cursoFilter}
                onChange={(e) => setCursoFilter(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="todos">Todos los cursos</option>
                {cursosConMaterial.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="todos">Todos los tipos</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="link">Enlace</option>
                <option value="doc">Documento</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <BookMarked size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No se encontraron materiales con ese filtro.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((m) => (
            <MaterialCard key={m.id} m={m} canDelete={canManage} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

