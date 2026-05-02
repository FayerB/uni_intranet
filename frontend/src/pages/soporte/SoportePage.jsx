import { useState, useEffect } from 'react';
import { HeadphonesIcon, Plus, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { soporteAPI } from '../../api/soporte';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../context/useStore';
import { MOCK } from '../../api/mock';
import Swal from 'sweetalert2';

const ESTADO_CONFIG = {
  abierto:     { label: 'Abierto',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   icon: AlertCircle },
  en_proceso:  { label: 'En proceso',  color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  resuelto:    { label: 'Resuelto',    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  icon: CheckCircle },
  cerrado:     { label: 'Cerrado',     color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',     icon: XCircle },
};

const PRIORIDAD_COLOR = {
  baja:   'text-gray-500',
  media:  'text-yellow-500',
  alta:   'text-orange-500',
  urgente:'text-red-500',
};

export default function SoportePage() {
  const { user } = useStore();
  const isAdmin = user?.role === 'admin';
  const [tickets, setTickets]   = useState(MOCK.tickets);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro]     = useState('todos');
  const [form, setForm]         = useState({ asunto: '', descripcion: '', categoria: 'tecnico', prioridad: 'media' });

  const fetchTickets = () => {
    setLoading(true);
    const fn = isAdmin ? soporteAPI.getAll : soporteAPI.getMios;
    fn().then((d) => setTickets(Array.isArray(d) ? d : MOCK.tickets))
       .catch(() => {})
       .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [isAdmin]);

  const handleCrear = async () => {
    if (!form.asunto.trim() || !form.descripcion.trim()) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos', showConfirmButton: false, timer: 1500 });
      return;
    }
    try {
      await soporteAPI.create(form);
      Swal.fire({ icon: 'success', title: 'Ticket creado', text: 'Te responderemos pronto.', showConfirmButton: false, timer: 1800 });
    } catch {
      setTickets(prev => [{ id: Date.now(), ...form, estado: 'abierto', created_at: new Date().toISOString() }, ...prev]);
      Swal.fire({ icon: 'success', title: 'Ticket enviado', showConfirmButton: false, timer: 1500 });
    }
    setShowForm(false);
    setForm({ asunto: '', descripcion: '', categoria: 'tecnico', prioridad: 'media' });
    fetchTickets();
  };

  const filtrados = filtro === 'todos' ? tickets : tickets.filter((t) => t.estado === filtro);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HeadphonesIcon className="text-violet-500" size={26} /> Centro de Soporte
        </h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus size={15} /> Nuevo ticket
        </button>
      </div>

      {/* Formulario nuevo ticket */}
      {showForm && (
        <Card className="p-5 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Crear ticket de soporte</h2>
          <input value={form.asunto} onChange={(e) => setForm(p => ({ ...p, asunto: e.target.value }))}
            placeholder="Asunto del problema" className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-violet-500 outline-none" />
          <textarea value={form.descripcion} onChange={(e) => setForm(p => ({ ...p, descripcion: e.target.value }))}
            rows={3} placeholder="Describe el problema con detalle..." className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:ring-2 focus:ring-violet-500 outline-none resize-none" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={form.categoria} onChange={(e) => setForm(p => ({ ...p, categoria: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <option value="tecnico">Técnico</option>
              <option value="academico">Académico</option>
              <option value="administrativo">Administrativo</option>
              <option value="otro">Otro</option>
            </select>
            <select value={form.prioridad} onChange={(e) => setForm(p => ({ ...p, prioridad: e.target.value }))}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <option value="baja">Prioridad baja</option>
              <option value="media">Prioridad media</option>
              <option value="alta">Prioridad alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancelar</button>
            <button onClick={handleCrear} className="px-4 py-2 bg-violet-600 text-white text-sm rounded-xl hover:bg-violet-700">Enviar ticket</button>
          </div>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['todos', 'abierto', 'en_proceso', 'resuelto', 'cerrado'].map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors capitalize ${filtro === f ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            {f === 'todos' ? 'Todos' : ESTADO_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Lista de tickets */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando tickets...</div>
      ) : filtrados.length === 0 ? (
        <Card><div className="text-center py-12 text-gray-400"><HeadphonesIcon size={36} className="mx-auto mb-3 opacity-40" /><p>No hay tickets en esta categoría</p></div></Card>
      ) : (
        <div className="space-y-3">
          {filtrados.map((t, i) => {
            const cfg = ESTADO_CONFIG[t.estado] || ESTADO_CONFIG.abierto;
            const Icon = cfg.icon;
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.asunto}</p>
                        <span className={`text-xs font-bold uppercase ${PRIORIDAD_COLOR[t.prioridad] || 'text-gray-400'}`}>{t.prioridad}</span>
                      </div>
                      {t.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.descripcion}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{t.categoria}</span>
                        <span>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${cfg.color}`}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
