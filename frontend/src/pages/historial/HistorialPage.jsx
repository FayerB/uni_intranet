import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, BookOpen, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { historialAPI } from '../../api/historial';

function SummaryCard({ icon, label, value, colorClass }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnioSection({ ciclo, index }) {
  const [open, setOpen] = useState(index === 0);

  const promedioColor =
    ciclo.promedio >= 14 ? 'text-success' :
    ciclo.promedio >= 11 ? 'text-warning' :
    'text-destructive';

  const aprobados = ciclo.cursos.filter((c) => c.estado === 'aprobado' || c.estado === 'Aprobado').length;

  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {ciclo.ciclo ? `Año ${ciclo.ciclo}` : 'Sin año asignado'}
            </p>
            <p className="text-sm text-gray-500">
              {ciclo.cursos.length} materia{ciclo.cursos.length !== 1 ? 's' : ''} · {aprobados} aprobada{aprobados !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-2xl font-bold ${promedioColor}`}>{ciclo.promedio.toFixed(1)}</p>
            <p className="text-xs text-gray-400">promedio</p>
          </div>
          {open ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Materia</th>
                  <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Código</th>
                  <th className="text-center py-2 font-medium text-gray-500 dark:text-gray-400">Nota</th>
                  <th className="text-center py-2 font-medium text-gray-500 dark:text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {ciclo.cursos.map((c) => {
                  const aprobado = (c.estado || '').toLowerCase() === 'aprobado';
                  return (
                    <tr key={c.codigo || c.nombre} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{c.nombre}</td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">{c.codigo || '—'}</td>
                      <td className={`py-3 text-center font-bold ${aprobado ? 'text-success' : c.promedio > 0 ? 'text-destructive' : 'text-gray-400'}`}>
                        {c.promedio > 0 ? c.promedio.toFixed(1) : '—'}
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={aprobado ? 'success' : c.promedio > 0 ? 'destructive' : 'gray'}>
                          {aprobado ? 'Aprobado' : c.promedio > 0 ? 'Reprobado' : 'Pendiente'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function HistorialPage() {
  const [historial, setHistorial] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    historialAPI.get()
      .then(setHistorial)
      .catch(() => setHistorial([]))
      .finally(() => setIsLoading(false));
  }, []);

  // El backend puede retornar array de ciclos directamente o { ciclos, resumen }
  const ciclos = Array.isArray(historial) ? historial : (historial?.ciclos ?? []);
  const totalMaterias = ciclos.reduce((s, c) => s + (c.cursos?.length ?? 0), 0);
  const totalAprobadas = ciclos.reduce(
    (s, c) => s + (c.cursos?.filter((m) => (m.estado || '').toLowerCase() === 'aprobado').length ?? 0),
    0
  );
  const promedioGlobal = (() => {
    const cursosConNota = ciclos.flatMap((c) => c.cursos ?? []).filter((m) => m.promedio > 0);
    if (!cursosConNota.length) return null;
    return (cursosConNota.reduce((s, m) => s + m.promedio, 0) / cursosConNota.length).toFixed(2);
  })();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <ScrollText className="mr-3 text-primary" size={28} />
          Historial Académico
        </h1>
        <p className="text-gray-500 mt-1">Registro completo de tu desempeño por año escolar.</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <SummaryCard
              icon={<Award size={22} className="text-primary" />}
              label="Materias Aprobadas"
              value={`${totalAprobadas} / ${totalMaterias}`}
              colorClass="bg-primary/10"
            />
            <SummaryCard
              icon={<TrendingUp size={22} className="text-success" />}
              label="Promedio General"
              value={promedioGlobal ?? '—'}
              colorClass="bg-success/10"
            />
            <SummaryCard
              icon={<BookOpen size={22} className="text-secondary" />}
              label="Años Escolares"
              value={ciclos.length}
              colorClass="bg-secondary/10"
            />
          </motion.div>

          <div className="space-y-4">
            {ciclos.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-gray-400">
                  <ScrollText size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay historial registrado aún.</p>
                </CardContent>
              </Card>
            ) : (
              ciclos.map((ciclo, i) => (
                <motion.div
                  key={ciclo.ciclo ?? i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                >
                  <AnioSection ciclo={ciclo} index={i} />
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
