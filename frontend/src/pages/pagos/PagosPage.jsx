import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { pagosAPI } from '../../api/pagos';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../context/useStore';
import { MOCK } from '../../api/mock';

const ESTADO_CONFIG = {
  pagado:   { label: 'Pagado',   color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  icon: CheckCircle },
  pendiente:{ label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  vencido:  { label: 'Vencido',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',    icon: AlertCircle },
};

export default function PagosPage() {
  const { user } = useStore();
  const isAdmin = user?.role === 'admin';
  const [pagos, setPagos]         = useState(MOCK.pagos);
  const [conceptos, setConceptos] = useState(MOCK.conceptosPago);
  const [loading, setLoading]     = useState(true);
  const [filtro, setFiltro]       = useState('todos');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      isAdmin ? pagosAPI.getAll() : pagosAPI.getMisPagos(),
      pagosAPI.getConceptos(),
    ])
      .then(([p, c]) => {
        setPagos(Array.isArray(p) ? p : MOCK.pagos);
        setConceptos(Array.isArray(c) ? c : MOCK.conceptosPago);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const filtrados = filtro === 'todos' ? pagos : pagos.filter((p) => p.estado === filtro);

  const resumen = {
    total:    pagos.reduce((s, p) => s + (p.monto || 0), 0),
    pagados:  pagos.filter((p) => p.estado === 'pagado').reduce((s, p) => s + (p.monto || 0), 0),
    pendientes: pagos.filter((p) => p.estado === 'pendiente').length,
    vencidos:   pagos.filter((p) => p.estado === 'vencido').length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <CreditCard className="text-emerald-500" size={26} /> Pagos y Finanzas
      </h1>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: `S/ ${resumen.total.toFixed(2)}`,     color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-800' },
          { label: 'Pagados',   value: `S/ ${resumen.pagados.toFixed(2)}`,   color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Pendientes', value: resumen.pendientes,                   color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Vencidos',  value: resumen.vencidos,                      color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`p-4 ${s.bg}`}>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['todos', 'pagado', 'pendiente', 'vencido'].map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors capitalize ${filtro === f ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            {f === 'todos' ? 'Todos' : ESTADO_CONFIG[f]?.label}
          </button>
        ))}
      </div>

      {/* Lista de pagos */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando pagos...</div>
      ) : filtrados.length === 0 ? (
        <Card><div className="text-center py-12 text-gray-400"><DollarSign size={36} className="mx-auto mb-3 opacity-40" /><p>No hay pagos en esta categoría</p></div></Card>
      ) : (
        <div className="space-y-3">
          {filtrados.map((p, i) => {
            const cfg = ESTADO_CONFIG[p.estado] || ESTADO_CONFIG.pendiente;
            const Icon = cfg.icon;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <DollarSign size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.concepto || p.descripcion || 'Pago'}</p>
                        <p className="text-xs text-gray-400">{p.fecha_vencimiento ? `Vence: ${new Date(p.fecha_vencimiento).toLocaleDateString()}` : '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-white">S/ {Number(p.monto || 0).toFixed(2)}</span>
                      <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${cfg.color}`}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Conceptos de pago */}
      {conceptos.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Conceptos de Pago</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {conceptos.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.nombre}</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">S/ {Number(c.monto || 0).toFixed(2)}</p>
                  {c.descripcion && <p className="text-xs text-gray-400 mt-1">{c.descripcion}</p>}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
