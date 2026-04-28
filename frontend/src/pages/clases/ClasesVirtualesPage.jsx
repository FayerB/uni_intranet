import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Video, Plus, Edit2, Trash2, ExternalLink, Calendar, User, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Card, CardContent } from '../../components/ui/Card';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useRole } from '../../hooks/useRole';
import { useStore } from '../../context/useStore';
import { clasesAPI } from '../../api/clasesVirtuales';
import { fetchSafe } from '../../api/fetchSafe';
import { MOCK } from '../../api/mock';
import api from '../../api';

// ─── Constantes ────────────────────────────────────────────────────────────────

const ESTADOS = ['programada', 'en_vivo', 'finalizada', 'cancelada'];

const ESTADO_LABEL = {
  programada: 'Programada',
  en_vivo:    'En vivo',
  finalizada: 'Finalizada',
  cancelada:  'Cancelada',
};

const ESTADO_BADGE = {
  programada: 'warning',
  en_vivo:    'primary',
  finalizada: 'gray',
  cancelada:  'secondary',
};

// Clases a las que un estudiante puede unirse
const ESTADO_JOINABLE = new Set(['programada', 'en_vivo']);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatFecha(iso) {
  return new Date(iso).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ─── Componente de tarjeta ─────────────────────────────────────────────────────

function ClaseCard({ clase, canManage, onEdit, onDelete }) {
  const joinable = ESTADO_JOINABLE.has(clase.estado);
  const isLive   = clase.estado === 'en_vivo';

  return (
    <Card hover className="h-full flex flex-col">
      <CardContent className="p-5 flex flex-col gap-3 h-full">

        {/* Título + estado */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">
            {clase.titulo}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
            <Badge variant={ESTADO_BADGE[clase.estado]}>
              {ESTADO_LABEL[clase.estado]}
            </Badge>
          </div>
        </div>

        {/* Descripción */}
        {clase.descripcion && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {clase.descripcion}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          {clase.curso && (
            <div className="flex items-center gap-2">
              <Video size={12} />
              <span className="truncate">{clase.curso}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            {formatFecha(clase.fecha_hora)}
          </div>
          {clase.docente && (
            <div className="flex items-center gap-2">
              <User size={12} />
              {clase.docente}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <a
            href={joinable ? clase.enlace : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!joinable}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors
              ${!joinable
                ? 'text-gray-300 dark:text-gray-600 pointer-events-none'
                : isLive
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
          >
            <ExternalLink size={14} />
            {isLive ? 'Unirse ahora' : 'Ver enlace'}
          </a>

          {canManage && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(clase)}
                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(clase)}
                className="p-2 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Eliminar / Cancelar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function ClasesVirtualesPage() {
  const { isAdmin, isDocente, isEstudiante } = useRole();
  const { user } = useStore();

  const [allClases, setAllClases]     = useState([]);   // datos crudos del servidor / mock
  const [cursos, setCursos]           = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClase, setEditingClase] = useState(null);
  const [isSaving, setIsSaving]       = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const canCreate = isAdmin || isDocente;
  const canManage = (clase) => isAdmin || (isDocente && clase.docente_id === user?.id);

  // Lista derivada: ambos filtros se aplican sobre los datos crudos sin re-fetch.
  // Esto garantiza que el filtro funcione tanto con datos reales como con el mock.
  const clases = useMemo(() => {
    let result = allClases;

    if (estadoFilter !== 'todas') {
      result = result.filter(c => c.estado === estadoFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(c => c.titulo.toLowerCase().includes(term));
    }

    return result;
  }, [allClases, estadoFilter, searchTerm]);

  // Carga cursos una sola vez para el formulario
  useEffect(() => {
    fetchSafe(api.get('/cursos'), MOCK.cursos).then(setCursos);
  }, []);

  // fetchClases solo depende del ciclo de vida (montar / después de mutaciones).
  // Los filtros son locales — no necesita re-fetchar cuando cambia estadoFilter o searchTerm.
  const fetchClases = useCallback(async () => {
    setIsLoading(true);
    const data = await clasesAPI.getAll();
    setAllClases(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchClases(); }, [fetchClases]);

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openModal = (clase = null) => {
    setEditingClase(clase);
    reset(clase
      ? {
          titulo:      clase.titulo,
          descripcion: clase.descripcion,
          enlace:      clase.enlace,
          fecha_hora:  clase.fecha_hora?.slice(0, 16),
          estado:      clase.estado,
          curso_id:    clase.curso_id,
        }
      : {
          titulo: '', descripcion: '', enlace: '',
          fecha_hora: '', estado: 'programada', curso_id: '',
        }
    );
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editingClase) {
        await clasesAPI.update(editingClase.id, data);
      } else {
        await clasesAPI.create(data);
      }
      Swal.fire({
        icon: 'success',
        title: editingClase ? 'Clase actualizada' : 'Clase creada',
        showConfirmButton: false,
        timer: 1500,
      });
      setIsModalOpen(false);
      fetchClases();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo guardar la clase.',
        confirmButtonColor: '#1e3a8a',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Eliminar / cancelar ────────────────────────────────────────────────────

  const handleDelete = (clase) => {
    const action = isAdmin ? 'eliminar' : 'cancelar';
    Swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} "${clase.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'No',
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return;
      try {
        await clasesAPI.remove(clase.id);
        Swal.fire({
          icon: 'success',
          title: isAdmin ? 'Clase eliminada' : 'Clase cancelada',
          showConfirmButton: false,
          timer: 1500,
        });
        fetchClases();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Error al procesar.',
          confirmButtonColor: '#1e3a8a',
        });
      }
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Video className="text-primary" size={28} />
            Clases Virtuales
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEstudiante
              ? 'Únete a tus clases en línea.'
              : 'Gestiona y programa sesiones virtuales.'}
          </p>
        </motion.div>

        {canCreate && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button onClick={() => openModal()}>
              <Plus size={16} className="mr-2" /> Nueva Clase
            </Button>
          </motion.div>
        )}
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            placeholder="Buscar por título..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-52"
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
        >
          <option value="todas">Todos los estados</option>
          {ESTADOS.map(e => (
            <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
          ))}
        </select>
      </motion.div>

      {/* Grid de clases */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : clases.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          <Video size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No hay clases virtuales disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clases.map((clase, i) => (
            <motion.div
              key={clase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <ClaseCard
                clase={clase}
                canManage={canManage(clase)}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClase ? 'Editar Clase Virtual' : 'Nueva Clase Virtual'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="text-sm font-medium mb-1 block">Título</label>
            <Input
              {...register('titulo', { required: 'Requerido' })}
              placeholder="Ej. Clase 01 — Introducción"
              error={errors.titulo}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descripción</label>
            <textarea
              {...register('descripcion')}
              rows={2}
              placeholder="Tema de la sesión..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Enlace (Zoom / Meet)</label>
            <Input
              {...register('enlace', { required: 'Requerido' })}
              placeholder="https://meet.google.com/..."
              error={errors.enlace}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Curso</label>
              <select
                {...register('curso_id', { required: 'Requerido' })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary"
              >
                <option value="">-- Seleccionar --</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.curso_id && (
                <p className="text-xs text-destructive mt-1">{errors.curso_id.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha y hora</label>
              <Input
                {...register('fecha_hora', { required: 'Requerido' })}
                type="datetime-local"
                error={errors.fecha_hora}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Estado</label>
            <select
              {...register('estado')}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary"
            >
              {ESTADOS.map(e => (
                <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
