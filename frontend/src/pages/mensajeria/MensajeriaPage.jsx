import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { mensajeriaAPI } from '../../api/mensajeria';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../context/useStore';
import { MOCK } from '../../api/mock';

export default function MensajeriaPage() {
  const { user } = useStore();
  const [conversaciones, setConversaciones] = useState(MOCK.conversaciones);
  const [activa, setActiva]     = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    mensajeriaAPI.getConversaciones()
      .then((d) => setConversaciones(Array.isArray(d) ? d : MOCK.conversaciones))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activa) {
      setLoading(true);
      mensajeriaAPI.getMensajes(activa.id)
        .then((d) => setMensajes(Array.isArray(d) ? d : MOCK.mensajes))
        .catch(() => setMensajes(MOCK.mensajes))
        .finally(() => setLoading(false));
    }
  }, [activa]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async () => {
    if (!texto.trim() || !activa) return;
    const msg = { id: Date.now(), contenido: texto, remitente_id: user?.id, remitente: user?.name, created_at: new Date().toISOString(), propio: true };
    setMensajes((p) => [...p, msg]);
    setTexto('');
    try { await mensajeriaAPI.enviar(activa.id, { contenido: texto }); } catch {}
  };

  const filtradas = conversaciones.filter((c) =>
    !search || c.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Lista de conversaciones */}
      <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-3">Mensajes</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
          {filtradas.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Sin conversaciones</p>
          ) : filtradas.map((c) => (
            <button key={c.id} onClick={() => setActiva(c)}
              className={`w-full text-left flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${activa?.id === c.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {c.nombre?.[0]?.toUpperCase() || <User size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.nombre}</p>
                <p className="text-xs text-gray-400 truncate">{c.ultimo_mensaje || 'Sin mensajes'}</p>
              </div>
              {c.no_leidos > 0 && (
                <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center shrink-0">{c.no_leidos}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {!activa ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Selecciona una conversación</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {activa.nombre?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{activa.nombre}</p>
                <p className="text-xs text-gray-400">{activa.rol || 'Usuario'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center text-gray-400 text-sm">Cargando mensajes...</div>
              ) : mensajes.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.propio || m.remitente_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${m.propio || m.remitente_id === user?.id
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'}`}>
                    <p>{m.contenido}</p>
                    <p className="text-[10px] opacity-60 mt-1">{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
              <input value={texto} onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleEnviar()}
                placeholder="Escribe un mensaje..." className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary outline-none" />
              <button onClick={handleEnviar} disabled={!texto.trim()}
                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
