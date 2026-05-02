import { useState, useEffect, useCallback } from 'react';
import { Library, Search, Download, ExternalLink, Plus, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRecursos, getCategorias, descargarRecurso } from '../../api/recursos';
import useDebounce from '../../hooks/useDebounce';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { useStore } from '../../context/useStore';

const TIPO_ICON = {
  pdf:       '📄', video: '🎬', enlace: '🔗',
  imagen:    '🖼️', audio: '🎵', documento: '📝', otro: '📁',
};

export default function RecursosPage() {
  const { user } = useStore();
  const [recursos, setRecursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [catId, setCatId] = useState('');
  const dSearch = useDebounce(search, 400);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        getRecursos({ search: dSearch || undefined, tipo: tipo || undefined, categoria_id: catId || undefined }),
        getCategorias(),
      ]);
      setRecursos(rRes.data.data);
      setCategorias(cRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dSearch, tipo, catId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDescargar = async (r) => {
    const { data } = await descargarRecurso(r.id);
    window.open(data.url || r.url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Library className="text-blue-600" size={26} />
          Biblioteca Digital
        </h1>
        {['admin', 'docente'].includes(user?.role) && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Agregar recurso
          </button>
        )}
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar recursos..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          {/* Tipo */}
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="">Todos los tipos</option>
            {['pdf', 'video', 'enlace', 'imagen', 'audio', 'documento', 'otro'].map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          {/* Categoría */}
          <select
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : recursos.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <Library size={40} className="mx-auto mb-3 opacity-40" />
            <p>No se encontraron recursos</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recursos.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{TIPO_ICON[r.tipo] || '📁'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm">
                      {r.titulo}
                    </h3>
                    {r.descripcion && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {r.descripcion}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.categoria && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: r.categoria_color }}
                        >
                          {r.categoria}
                        </span>
                      )}
                      {r.etiquetas?.slice(0, 2).map((e) => (
                        <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <Tag size={9} />
                          {e}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {r.descargas} descarga{r.descargas !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDescargar(r)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                >
                  {r.tipo === 'enlace' ? <ExternalLink size={14} /> : <Download size={14} />}
                  {r.tipo === 'enlace' ? 'Abrir enlace' : 'Descargar'}
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
