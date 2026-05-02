import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import api from '../../api';
import { useStore } from '../../context/useStore';

const CATEGORIES = ['Todas', 'Institucional', 'Eventos', 'Académico', 'Deportes', 'General'];

export default function NoticiasPage() {
  const { user } = useStore();
  const canWrite = user?.role === 'admin' || user?.role === 'docente';
  const canDelete = user?.role === 'admin';

  const [noticias, setNoticias]           = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [filter, setFilter]               = useState('Todas');
  const [selectedNoticia, setSelectedNoticia] = useState(null);
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [isSaving, setIsSaving]           = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchNoticias = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'Todas' ? { categoria: filter } : {};
      const res = await api.get('/noticias', { params });
      setNoticias(res.data);
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar las noticias.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchNoticias(); }, [fetchNoticias]);

  const openForm = (noticia = null) => {
    setEditingNoticia(noticia);
    reset(noticia
      ? { titulo: noticia.title, resumen: noticia.excerpt, contenido: noticia.content, categoria: noticia.category, imagen_url: noticia.image || '' }
      : { titulo: '', resumen: '', contenido: '', categoria: 'General', imagen_url: '' }
    );
    setIsFormOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editingNoticia) {
        await api.put(`/noticias/${editingNoticia.id}`, data);
      } else {
        await api.post('/noticias', data);
      }
      Swal.fire({ icon: 'success', title: editingNoticia ? 'Noticia actualizada' : 'Noticia publicada', showConfirmButton: false, timer: 1500 });
      setIsFormOpen(false);
      fetchNoticias();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al guardar.', confirmButtonColor: '#1e3a8a' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (noticia) => {
    Swal.fire({
      title: `¿Eliminar "${noticia.title}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await api.delete(`/noticias/${noticia.id}`);
        Swal.fire({ icon: 'success', title: 'Noticia eliminada', showConfirmButton: false, timer: 1500 });
        fetchNoticias();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Error al eliminar.', confirmButtonColor: '#1e3a8a' });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Noticias y Avisos</h1>
          <p className="text-gray-500 mt-2 text-lg">Mantente informado sobre lo que ocurre en tu colegio.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === c
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-600 dark:text-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
          {canWrite && (
            <Button onClick={() => openForm()} className="ml-2">
              <Plus size={16} className="mr-1" /> Nueva
            </Button>
          )}
        </motion.div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Cargando noticias...</div>
      ) : noticias.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No hay noticias publicadas.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {noticias.map((noticia, i) => (
            <motion.div
              key={noticia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col group overflow-hidden border-0 shadow-lg shadow-gray-200/50 dark:shadow-black/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  {noticia.image ? (
                    <img src={noticia.image} alt={noticia.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Tag size={40} className="text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge variant="primary" className="bg-white/90 text-primary uppercase tracking-wider text-[10px] font-bold backdrop-blur-sm border-0">
                      {noticia.category}
                    </Badge>
                  </div>
                  {(canWrite || canDelete) && (
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canWrite && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openForm(noticia); }}
                          className="p-1.5 bg-white/90 rounded-lg text-primary hover:bg-white transition-colors shadow"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(noticia); }}
                          className="p-1.5 bg-white/90 rounded-lg text-destructive hover:bg-white transition-colors shadow"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <CardContent className="flex-1 flex flex-col p-6">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <Calendar size={12} className="mr-1" /> {noticia.date}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {noticia.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-1">
                    {noticia.excerpt}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setSelectedNoticia(noticia)}
                      className="flex items-center text-sm font-semibold text-primary group-hover:text-primary-600 transition-colors"
                    >
                      Leer artículo completo
                      <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal lectura */}
      <Modal
        isOpen={!!selectedNoticia}
        onClose={() => setSelectedNoticia(null)}
        title={<span className="flex items-center"><Tag size={18} className="mr-2 text-primary" />{selectedNoticia?.category}</span>}
        className="max-w-2xl w-full p-0 overflow-hidden"
      >
        {selectedNoticia && (
          <div className="flex flex-col">
            <div className="w-full h-64 md:h-80 relative">
              {selectedNoticia.image ? (
                <img src={selectedNoticia.image} alt={selectedNoticia.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{selectedNoticia.title}</h2>
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <div className="flex items-center font-medium"><User size={16} className="mr-2 text-primary" /> {selectedNoticia.author}</div>
                <div className="flex items-center"><Calendar size={16} className="mr-2" /> {selectedNoticia.date}</div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                {selectedNoticia.content}
              </p>
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <Button onClick={() => setSelectedNoticia(null)}>Cerrar</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal crear/editar */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingNoticia ? 'Editar Noticia' : 'Nueva Noticia'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Título</label>
            <Input
              {...register('titulo', { required: 'Requerido', maxLength: { value: 150, message: 'Máximo 150 caracteres' } })}
              placeholder="Título de la noticia"
              error={errors.titulo}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Resumen</label>
            <Input
              {...register('resumen', { required: 'Requerido', maxLength: { value: 300, message: 'Máximo 300 caracteres' } })}
              placeholder="Breve descripción visible en la tarjeta"
              error={errors.resumen}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Contenido</label>
            <textarea
              {...register('contenido', { required: 'Requerido' })}
              rows={5}
              placeholder="Contenido completo del artículo..."
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            {errors.contenido && <p className="text-xs text-red-500 mt-1">{errors.contenido.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Categoría</label>
              <select
                {...register('categoria')}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-primary focus:border-primary"
              >
                {CATEGORIES.filter(c => c !== 'Todas').map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL de imagen</label>
              <Input {...register('imagen_url')} placeholder="https://..." />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving}>Publicar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
