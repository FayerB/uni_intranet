import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, X, Check, Trash2, Users, BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { circularesAPI } from '../../api/circulares';
import { useRole } from '../../hooks/useRole';
import Swal from 'sweetalert2';

const DEST_OPTS = [
  { value: 'todos',        label: 'Todos',        icon: Users },
  { value: 'docentes',     label: 'Docentes',     icon: BookOpen },
  { value: 'estudiantes',  label: 'Estudiantes',  icon: GraduationCap },
];

const destLabel = (v) => DEST_OPTS.find((o) => o.value === v)?.label ?? v;

const destColor = (v) => ({
  todos:        'bg-primary/10 text-primary',
  docentes:     'bg-secondary/10 text-secondary',
  estudiantes:  'bg-success/10 text-success',
}[v] ?? 'bg-gray-100 text-gray-500');

export default function CircularesPage() {
  const { isAdmin, isDocente } = useRole();
  const canCreate = isAdmin || isDocente;

  const [circulares, setCirculares] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ titulo: '', contenido: '', destinatario: 'todos' });

  const unread = circulares.filter((c) => !c.leida).length;

  const load = async () => {
    setLoading(true);
    try {
      const data = await circularesAPI.getAll();
      setCirculares(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    setCirculares((prev) => prev.map((c) => c.id === id ? { ...c, leida: true } : c));
    try { await circularesAPI.marcarLeida(id); } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.contenido.trim()) return;
    setSaving(true);
    try {
      await circularesAPI.create(form);
      setShowForm(false);
      setForm({ titulo: '', contenido: '', destinatario: 'todos' });
      await load();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo publicar la circular.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: '¿Eliminar circular?',
      text: 'Esta acción la ocultará para todos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });
    if (!res.isConfirmed) return;
    try {
      await circularesAPI.remove(id);
      setCirculares((prev) => prev.filter((c) => c.id !== id));
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar.', confirmButtonColor: '#1e3a8a' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Megaphone className="text-primary" size={28} />
            Circulares
            {unread > 0 && (
              <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                {unread} nueva{unread !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Comunicados oficiales de la institución.</p>
        </motion.div>

        {canCreate && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} /> Nueva circular
            </button>
          </motion.div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : circulares.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
          <p>No hay circulares publicadas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {circulares.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 transition-colors
                ${!c.leida ? 'border-primary/30 dark:border-primary/20' : 'border-gray-100 dark:border-gray-700'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {!c.leida && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{c.titulo}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${destColor(c.destinatario)}`}>
                      {destLabel(c.destinatario)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{c.contenido}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>{c.autor}</span>
                    <span>·</span>
                    <span>{new Date(c.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!c.leida && (
                    <button
                      onClick={() => handleRead(c.id)}
                      title="Marcar como leída"
                      className="p-2 rounded-xl text-gray-400 hover:text-success hover:bg-success/10 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  {canCreate && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Eliminar"
                      className="p-2 rounded-xl text-gray-400 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">Nueva circular</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                  <input
                    value={form.titulo}
                    onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                    required maxLength={200}
                    className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none dark:text-white"
                    placeholder="Ej: Inicio de clases 2026-I"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenido</label>
                  <textarea
                    value={form.contenido}
                    onChange={(e) => setForm((p) => ({ ...p, contenido: e.target.value }))}
                    required rows={5}
                    className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none resize-none dark:text-white"
                    placeholder="Escribe el contenido de la circular..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destinatarios</label>
                  <div className="flex flex-wrap gap-2">
                    {DEST_OPTS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, destinatario: value }))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-colors
                          ${form.destinatario === value
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary/50'}`}
                      >
                        <Icon size={14} /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />}
                    Publicar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
