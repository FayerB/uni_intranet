import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, User, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mensajeriaAPI } from '../../api/mensajeria';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../context/useStore';
import { MOCK } from '../../api/mock';
import api from '../../api';

export default function MensajeriaPage() {
  const { user } = useStore();
  const [conversaciones, setConversaciones] = useState(MOCK.conversaciones);
  const [activa, setActiva]         = useState(null);
  const [mensajes, setMensajes]     = useState([]);
  const [texto, setTexto]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [showNueva, setShowNueva]   = useState(false);
  const [usuarios, setUsuarios]     = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const bottomRef = useRef(null);

  const fetchConversaciones = () => {
    mensajeriaAPI.getConversaciones()
      .then((d) => setConversaciones(Array.isArray(d) ? d : MOCK.conversaciones))
      .catch(() => {});
  };

  useEffect(() => { fetchConversaciones(); }, []);

  useEffect(() => {
    if (showNueva) {
      api.get('/usuarios').then((r) => setUsuarios(r.data || MOCK.usuarios)).catch(() => setUsuarios(MOCK.usuarios));
    }
  }, [showNueva]);

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
    const textoCopy = texto;
    setTexto('');
    try { await mensajeriaAPI.enviar(activa.id, { contenido: textoCopy }); } catch {}
  };

  const handleIniciarConv = async (destinatario) => {
    try {
      const conv = await mensajeriaAPI.iniciarDirecta({ destinatario_id: destinatario.id });
      const nueva = conv?.data || { id: Date.now(), nombre: destinatario.name || destinatario.nombre, rol: destinatario.role || destinatario.rol, ultimo_mensaje: '', no_leidos: 0 };
      setConversaciones((p) => {
        const existe = p.find((c) => c.id === nueva.id);
        return existe ? p : [nueva, ...p];
      });
      setActiva(nueva);
    } catch {
      const nueva = { id: Date.now(), nombre: destinatario.name || destinatario.nombre, rol: destinatario.role || destinatario.rol, ultimo_mensaje: '', no_leidos: 0 };
      setConversaciones((p) => [nueva, ...p]);
      setActiva(nueva);
    }
    setShowNueva(false);
    setSearchUser('');
  };

  const filtradas = conversaciones.filter((c) =>
    !search || c.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const usuariosFiltrados = usuarios
    .filter((u) => u.id !== user?.id)
    .filter((u) => !searchUser || (u.name || u.nombre)?.toLowerCase().includes(searchUser.toLowerCase()));

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Lista de conversaciones */}
      <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white">Mensajes</h2>
            <button onClick={() => setShowNueva(true)}
              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              title="Nueva conversación">
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversación..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
          {filtradas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin conversaciones</p>
              <button onClick={() => setShowNueva(true)} className="text-xs text-primary hover:underline mt-1">Iniciar una</button>
            </div>
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <MessageSquare size={48} className="opacity-30" />
            <p className="text-sm">Selecciona una conversación</p>
            <button onClick={() => setShowNueva(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus size={15} /> Nueva conversación
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {activa.nombre?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{activa.nombre}</p>
                <p className="text-xs text-gray-400 capitalize">{activa.rol || 'Usuario'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center text-gray-400 text-sm py-8">Cargando mensajes...</div>
              ) : mensajes.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">No hay mensajes aún. ¡Sé el primero en escribir!</div>
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

      {/* Modal nueva conversación */}
      <AnimatePresence>
        {showNueva && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNueva(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">Nueva conversación</h3>
                <button onClick={() => setShowNueva(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={searchUser} onChange={(e) => setSearchUser(e.target.value)} autoFocus
                    placeholder="Buscar usuario..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {usuariosFiltrados.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-4">No se encontraron usuarios</p>
                  ) : usuariosFiltrados.map((u) => (
                    <button key={u.id} onClick={() => handleIniciarConv(u)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {(u.name || u.nombre)?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name || u.nombre}</p>
                        <p className="text-xs text-gray-400 capitalize">{u.role || u.rol}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
