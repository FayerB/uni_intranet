import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle, AlertCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTareas, createTarea, entregar } from '../../api/tareas';
import { useStore } from '../../context/useStore';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../api';

const TIPO_BADGE = {
  tarea:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  proyecto:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  laboratorio: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  practica:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function estadoEntrega(tarea) {
  if (tarea.mi_entrega?.estado === 'calificado') return 'calificado';
  if (tarea.mi_entrega?.estado === 'entregado')  return 'entregado';
  if (isPast(new Date(tarea.fecha_entrega)))     return 'vencido';
  const diff = new Date(tarea.fecha_entrega) - new Date();
  if (diff > 0 && diff < 86400000) return 'urgente';
  return 'pendiente';
}

const ESTADO_UI = {
  pendiente:  { icon: Clock,         color: 'text-gray-400',  label: 'Pendiente' },
  urgente:    { icon: AlertCircle,   color: 'text-red-500',   label: '¡Vence hoy!' },
  vencido:    { icon: AlertCircle,   color: 'text-red-400',   label: 'Vencido' },
  entregado:  { icon: CheckCircle,   color: 'text-blue-500',  label: 'Entregado' },
  calificado: { icon: CheckCircle,   color: 'text-green-500', label: 'Calificado' },
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

function ModalCrear({ cursos, onClose, onCreated }) {
  const [form, setForm] = useState({
    titulo: '', descripcion: '', fecha_entrega: '', puntaje_max: 100,
    tipo: 'tarea', curso_id: cursos[0]?.id || '', permite_entrega_tardia: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createTarea(form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la tarea');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Título</label>
        <input
          required
          value={form.titulo}
          onChange={(e) => set('titulo', e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej. Ejercicios de álgebra lineal"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={(e) => set('descripcion', e.target.value)}
          rows={3}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Instrucciones de la tarea..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => set('tipo', e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tarea">Tarea</option>
            <option value="proyecto">Proyecto</option>
            <option value="laboratorio">Laboratorio</option>
            <option value="practica">Práctica</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Puntaje máx.</label>
          <input
            type="number" min={1} max={100}
            value={form.puntaje_max}
            onChange={(e) => set('puntaje_max', Number(e.target.value))}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Curso</label>
        <select
          required
          value={form.curso_id}
          onChange={(e) => set('curso_id', e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Fecha de entrega</label>
        <input
          required
          type="datetime-local"
          value={form.fecha_entrega}
          onChange={(e) => set('fecha_entrega', e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={form.permite_entrega_tardia}
          onChange={(e) => set('permite_entrega_tardia', e.target.checked)}
          className="rounded"
        />
        Permitir entrega tardía
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50">
          {saving ? 'Guardando...' : 'Crear tarea'}
        </button>
      </div>
    </form>
  );
}

function ModalDetalle({ tarea, userRole, onClose, onEntregado }) {
  const estado = estadoEntrega(tarea);
  const { icon: Icon, color, label } = ESTADO_UI[estado];
  const [url, setUrl]       = useState('');
  const [nota, setNota]     = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr]         = useState('');

  const submitEntrega = async (e) => {
    e.preventDefault();
    setSending(true);
    setErr('');
    try {
      await entregar(tarea.id, { url_entrega: url, comentario: nota });
      onEntregado();
      onClose();
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Error al entregar');
    } finally {
      setSending(false);
    }
  };

  const vence = new Date(tarea.fecha_entrega);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Icon size={24} className={`flex-shrink-0 mt-0.5 ${color}`} />
        <div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_BADGE[tarea.tipo] || ''}`}>
            {tarea.tipo}
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {tarea.curso} — {label}
          </p>
          <p className={`text-xs mt-0.5 ${isPast(vence) ? 'text-red-400' : 'text-gray-400'}`}>
            {isPast(vence) ? 'Venció ' : 'Vence '}
            {formatDistanceToNow(vence, { addSuffix: true, locale: es })}
          </p>
        </div>
        <span className="ml-auto text-lg font-bold text-gray-700 dark:text-gray-200">
          {tarea.puntaje_max} pts
        </span>
      </div>

      {tarea.descripcion && (
        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          {tarea.descripcion}
        </p>
      )}

      {tarea.mi_entrega?.calificacion != null && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">Calificación obtenida</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {tarea.mi_entrega.calificacion} / {tarea.puntaje_max}
          </p>
        </div>
      )}

      {userRole === 'estudiante' && estado === 'pendiente' && (
        <form onSubmit={submitEntrega} className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Entregar tarea</p>
          <input
            type="url"
            required
            placeholder="URL de tu entrega (Drive, GitHub, etc.)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Comentario opcional..."
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button
            type="submit" disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {sending ? 'Enviando...' : 'Enviar entrega'}
          </button>
        </form>
      )}

      {userRole === 'estudiante' && estado === 'entregado' && (
        <p className="text-sm text-blue-600 dark:text-blue-400 text-center py-2">
          Entrega enviada. Esperando calificación.
        </p>
      )}

      {userRole === 'estudiante' && estado === 'vencido' && !tarea.mi_entrega && (
        <p className="text-sm text-red-500 text-center py-2">
          La fecha de entrega ya pasó.
        </p>
      )}
    </div>
  );
}

export default function TareasPage() {
  const { user } = useStore();
  const [tareas, setTareas]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filtro, setFiltro]       = useState('todas');
  const [cursos, setCursos]       = useState([]);
  const [modalCrear, setModalCrear]     = useState(false);
  const [tareaDetalle, setTareaDetalle] = useState(null);

  const cargarTareas = () => {
    setLoading(true);
    getTareas()
      .then(({ data }) => setTareas(Array.isArray(data) ? data : []))
      .catch(() => setTareas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarTareas();
    if (['admin', 'docente'].includes(user?.role)) {
      api.get('/cursos').then(({ data }) => setCursos(Array.isArray(data) ? data : [])).catch(() => {});
    }
  }, [user?.role]);

  const tareasFiltradas = tareas.filter((t) =>
    filtro === 'todas' ? true : estadoEntrega(t) === filtro
  );

  const pendientes = tareas.filter((t) => ['pendiente', 'urgente'].includes(estadoEntrega(t))).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-blue-600" size={26} />
            Tareas
          </h1>
          {pendientes > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              {pendientes} tarea{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {['admin', 'docente'].includes(user?.role) && (
          <button
            onClick={() => setModalCrear(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Nueva tarea
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['todas', 'pendiente', 'entregado', 'calificado', 'vencido'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filtro === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : tareasFiltradas.length === 0 ? (
        <Card>
          <div className="text-center py-10 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
            <p>No hay tareas en este filtro</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {tareasFiltradas.map((tarea, i) => {
            const estado = estadoEntrega(tarea);
            const { icon: Icon, color, label } = ESTADO_UI[estado];
            const vence = new Date(tarea.fecha_entrega);
            return (
              <motion.div
                key={tarea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setTareaDetalle(tarea)}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={22} className={`flex-shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{tarea.titulo}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_BADGE[tarea.tipo] || ''}`}>
                          {tarea.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {tarea.curso} — {label}
                      </p>
                      <p className={`text-xs mt-1 ${isPast(vence) ? 'text-red-400' : 'text-gray-400'}`}>
                        {isPast(vence) ? 'Venció ' : 'Vence '}
                        {formatDistanceToNow(vence, { addSuffix: true, locale: es })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {tarea.puntaje_max} pts
                      </p>
                      {tarea.mi_entrega?.calificacion != null && (
                        <p className="text-lg font-bold text-green-600">{tarea.mi_entrega.calificacion}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalCrear && (
          <Modal title="Nueva Tarea" onClose={() => setModalCrear(false)}>
            <ModalCrear
              cursos={cursos}
              onClose={() => setModalCrear(false)}
              onCreated={cargarTareas}
            />
          </Modal>
        )}
        {tareaDetalle && (
          <Modal title={tareaDetalle.titulo} onClose={() => setTareaDetalle(null)}>
            <ModalDetalle
              tarea={tareaDetalle}
              userRole={user?.role}
              onClose={() => setTareaDetalle(null)}
              onEntregado={cargarTareas}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
