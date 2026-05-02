import { useState, useEffect } from 'react';
import { MessageSquare, Plus, ChevronRight, Pin, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { forosAPI } from '../../api/foros';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../context/useStore';
import { MOCK } from '../../api/mock';
import Swal from 'sweetalert2';

export default function ForosPage() {
  const { user } = useStore();
  const canWrite = ['admin', 'docente'].includes(user?.role);
  const [foros, setForos]       = useState(MOCK.foros);
  const [hilos, setHilos]       = useState([]);
  const [foroActivo, setForoActivo] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nuevoHilo, setNuevoHilo] = useState({ titulo: '', contenido: '' });

  useEffect(() => {
    if (foroActivo) {
      setLoading(true);
      forosAPI.getHilos(foroActivo.id)
        .then((data) => setHilos(Array.isArray(data) ? data : MOCK.hilos))
        .catch(() => setHilos(MOCK.hilos))
        .finally(() => setLoading(false));
    }
  }, [foroActivo]);

  const handleCrearHilo = async () => {
    if (!nuevoHilo.titulo.trim()) return;
    try {
      await forosAPI.createHilo(foroActivo.id, nuevoHilo);
      setShowForm(false);
      setNuevoHilo({ titulo: '', contenido: '' });
      forosAPI.getHilos(foroActivo.id).then((d) => setHilos(Array.isArray(d) ? d : MOCK.hilos));
      Swal.fire({ icon: 'success', title: 'Hilo creado', showConfirmButton: false, timer: 1200 });
    } catch {
      setHilos(prev => [...prev, { id: Date.now(), titulo: nuevoHilo.titulo, contenido: nuevoHilo.contenido, autor: user?.name, fijado: false, respuestas: 0, created_at: new Date().toISOString() }]);
      setShowForm(false);
      setNuevoHilo({ titulo: '', contenido: '' });
    }
  };

  if (foroActivo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setForoActivo(null); setHilos([]); }} className="text-primary hover:underline text-sm">← Foros</button>
          <ChevronRight size={14} className="text-gray-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{foroActivo.titulo}</h1>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{hilos.length} hilo(s) en este foro</p>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={15} /> Nuevo hilo
          </button>
        </div>

        {showForm && (
          <Card className="p-4 space-y-3">
            <input value={nuevoHilo.titulo} onChange={(e) => setNuevoHilo(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Título del hilo" className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary outline-none" />
            <textarea value={nuevoHilo.contenido} onChange={(e) => setNuevoHilo(p => ({ ...p, contenido: e.target.value }))}
              rows={3} placeholder="Escribe tu mensaje..." className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary outline-none resize-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancelar</button>
              <button onClick={handleCrearHilo} className="px-4 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary/90">Publicar</button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando hilos...</div>
        ) : hilos.length === 0 ? (
          <Card><div className="text-center py-12 text-gray-400"><MessageSquare size={36} className="mx-auto mb-3 opacity-40" /><p>Sin hilos aún. ¡Sé el primero en publicar!</p></div></Card>
        ) : (
          <div className="space-y-3">
            {hilos.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start gap-3">
                    {h.fijado && <Pin size={14} className="text-primary mt-1 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{h.titulo}</h3>
                      {h.contenido && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{h.contenido}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User size={11} />{h.autor || 'Anónimo'}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={11} />{h.respuestas || 0} respuestas</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{h.created_at ? new Date(h.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="text-indigo-500" size={26} /> Foros de Discusión
        </h1>
        {canWrite && (
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} /> Nuevo foro
          </button>
        )}
      </div>

      {foros.length === 0 ? (
        <Card><div className="text-center py-16 text-gray-400"><MessageSquare size={40} className="mx-auto mb-3 opacity-40" /><p>No hay foros disponibles</p></div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foros.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setForoActivo(f)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{f.titulo}</h3>
                    {f.descripcion && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{f.descripcion}</p>}
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MessageSquare size={11} />{f.hilos || 0} hilos</span>
                      <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{f.curso || 'General'}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 mt-1 shrink-0" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
