import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart4, Filter, FileSpreadsheet, FileText,
  Users, BookOpen, ClipboardList, CheckSquare,
  CreditCard, HeadphonesIcon, GraduationCap, Newspaper,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import api from '../../api';
import { fetchSafe } from '../../api/fetchSafe';
import { MOCK } from '../../api/mock';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

const REPORT_TYPES = [
  { key: 'usuarios',   label: 'Usuarios',   icon: Users },
  { key: 'noticias',   label: 'Noticias',   icon: Newspaper },
  { key: 'cursos',     label: 'Cursos',     icon: BookOpen },
  { key: 'matriculas', label: 'Matrículas', icon: ClipboardList },
  { key: 'notas',      label: 'Notas',      icon: GraduationCap },
  { key: 'asistencia', label: 'Asistencia', icon: CheckSquare },
  { key: 'tareas',     label: 'Tareas',     icon: ClipboardList },
  { key: 'pagos',      label: 'Pagos',      icon: CreditCard },
  { key: 'soporte',    label: 'Soporte',    icon: HeadphonesIcon },
];

const rolBadge = { admin: 'primary', docente: 'secondary', estudiante: 'success' };

export default function ReportesPage() {
  const [resumen, setResumen]         = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [tipo, setTipo]               = useState('usuarios');
  const [exporting, setExporting]     = useState('');

  useEffect(() => {
    fetchSafe(api.get('/reportes/resumen'), MOCK.reportesResumen)
      .then(setResumen)
      .finally(() => setIsLoading(false));
  }, []);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const resp = await api.get(`/reportes/exportar/${format}`, { responseType: 'blob' });
      const url  = URL.createObjectURL(new Blob([resp.data]));
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `reporte-sistema.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al generar el reporte. Intenta nuevamente.');
    } finally {
      setExporting('');
    }
  };

  const current = REPORT_TYPES.find((r) => r.key === tipo);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart4 className="mr-3 text-primary" size={28} />
            Centro de Reportes
          </h1>
          <p className="text-gray-500 mt-1">Estadísticas en tiempo real de todo el sistema.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filtros */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-semibold flex items-center text-sm">
              <Filter size={16} className="mr-2 text-primary" /> Módulo
            </div>
            <CardContent className="p-2">
              {REPORT_TYPES.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTipo(key)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    tipo === key
                      ? 'bg-primary text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Export */}
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 font-semibold text-sm">Exportar todo</div>
            <CardContent className="p-3 space-y-2">
              <button onClick={() => handleExport('excel')} disabled={!!exporting}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
                <FileSpreadsheet size={16} />
                {exporting === 'excel' ? 'Generando...' : 'Descargar Excel'}
              </button>
              <button onClick={() => handleExport('pdf')} disabled={!!exporting}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
                <FileText size={16} />
                {exporting === 'pdf' ? 'Generando...' : 'Descargar PDF'}
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contenido */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-6">

          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {current && <current.icon size={18} className="text-primary" />}
                {current?.label}
              </h3>
              {!isLoading && (
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  Tiempo real
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-gray-400">Cargando datos...</div>
            ) : (
              <ReporteContenido tipo={tipo} resumen={resumen} />
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ReporteContenido({ tipo, resumen }) {
  if (!resumen) return null;

  switch (tipo) {
    case 'usuarios':   return <ReporteUsuarios data={resumen.usuarios ?? []} />;
    case 'noticias':   return <ReporteNoticias data={resumen.noticias ?? []} />;
    case 'cursos':     return <ReporteCursos data={resumen.cursos ?? []} />;
    case 'matriculas': return <ReporteBarras data={resumen.matriculas ?? []} labelKey="estado" valueKey="total" title="Matrículas por estado" />;
    case 'notas':      return <ReporteNotas data={resumen.notas ?? []} />;
    case 'asistencia': return <ReportePie data={resumen.asistencia ?? []} labelKey="estado" valueKey="total" />;
    case 'tareas':     return <ReportePie data={resumen.tareas ?? []} labelKey="estado" valueKey="total" />;
    case 'pagos':      return <ReportePagos data={resumen.pagos ?? []} />;
    case 'soporte':    return <ReporteSoporte data={resumen.soporte ?? []} />;
    default:           return null;
  }
}

/* ── Usuarios ── */
function ReporteUsuarios({ data }) {
  const total = data.reduce((s, r) => s + r.total, 0);
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {data.map((r) => (
          <div key={r.rol} className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{r.total}</p>
            <p className="text-xs text-gray-500 capitalize mt-1">{r.rol}s</p>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="rol" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="activos" name="Activos" fill="#3b82f6" radius={[4,4,0,0]} />
          <Bar dataKey="inactivos" name="Inactivos" fill="#ef4444" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <Table className="border-0 shadow-none rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead>Rol</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Activos</TableHead>
            <TableHead className="text-center">Inactivos</TableHead>
            <TableHead className="text-center">% Activos</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {data.map((r) => {
            const pct = r.total > 0 ? Math.round((r.activos / r.total) * 100) : 0;
            return (
              <TableRow key={r.rol}>
                <TableCell><Badge variant={rolBadge[r.rol] || 'gray'}>{r.rol}</Badge></TableCell>
                <TableCell className="text-center font-medium">{r.total}</TableCell>
                <TableCell className="text-center text-emerald-600 font-medium">{r.activos}</TableCell>
                <TableCell className="text-center text-red-500 font-medium">{r.inactivos}</TableCell>
                <TableCell className="text-center">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${pct >= 80 ? 'bg-primary/10 text-primary' : pct >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {pct}%
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="font-bold bg-gray-50 dark:bg-gray-700/30">
            <TableCell>Total</TableCell>
            <TableCell className="text-center">{data.reduce((s,r)=>s+r.total,0)}</TableCell>
            <TableCell className="text-center text-emerald-600">{data.reduce((s,r)=>s+r.activos,0)}</TableCell>
            <TableCell className="text-center text-red-500">{data.reduce((s,r)=>s+r.inactivos,0)}</TableCell>
            <TableCell />
          </TableRow>
        </tbody>
      </Table>
    </div>
  );
}

/* ── Noticias ── */
function ReporteNoticias({ data }) {
  if (!data.length) return <Empty msg="No hay noticias registradas." />;
  return (
    <div className="p-4 space-y-6">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="publicadas" name="Publicadas" fill="#10b981" radius={[4,4,0,0]} />
          <Bar dataKey="ocultas" name="Ocultas" fill="#6b7280" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <Table className="border-0 shadow-none rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Publicadas</TableHead>
            <TableHead className="text-center">Ocultas</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {data.map((r) => (
            <TableRow key={r.categoria}>
              <TableCell className="font-medium">{r.categoria}</TableCell>
              <TableCell className="text-center">{r.total}</TableCell>
              <TableCell className="text-center text-emerald-600 font-medium">{r.publicadas}</TableCell>
              <TableCell className="text-center text-gray-400 font-medium">{r.ocultas}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

/* ── Cursos ── */
function ReporteCursos({ data }) {
  if (!data.length) return <Empty msg="No hay cursos registrados." />;
  return (
    <div className="p-4 space-y-6">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4,4,0,0]} />
          <Bar dataKey="total_matriculados" name="Matriculados" fill="#8b5cf6" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <Table className="border-0 shadow-none rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Activos</TableHead>
            <TableHead className="text-center">Matriculados</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {data.map((r) => (
            <TableRow key={r.tipo}>
              <TableCell className="font-medium">{r.tipo}</TableCell>
              <TableCell className="text-center">{r.total}</TableCell>
              <TableCell className="text-center text-emerald-600 font-medium">{r.activos}</TableCell>
              <TableCell className="text-center text-primary font-medium">{r.total_matriculados}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

/* ── Notas ── */
function ReporteNotas({ data }) {
  if (!data.length) return <Empty msg="No hay notas registradas." />;
  return (
    <div className="p-4 space-y-6">
      <ReportePie data={data} labelKey="estado" valueKey="total" />
      <Table className="border-0 shadow-none rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Promedio</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {data.map((r) => (
            <TableRow key={r.estado}>
              <TableCell>
                <Badge variant={r.estado === 'aprobado' ? 'success' : 'destructive'}>{r.estado}</Badge>
              </TableCell>
              <TableCell className="text-center font-medium">{r.total}</TableCell>
              <TableCell className="text-center font-medium">{r.promedio_nota}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

/* ── Pagos ── */
function ReportePagos({ data }) {
  if (!data.length) return <Empty msg="No hay pagos registrados." />;
  const total = data.reduce((s, r) => s + Number(r.monto_total || 0), 0);
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.map((r) => (
          <div key={r.estado} className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-primary">{r.total}</p>
            <p className="text-xs text-gray-500 capitalize mt-1">{r.estado}</p>
            <p className="text-xs text-gray-400 mt-0.5">S/ {Number(r.monto_total || 0).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <Table className="border-0 shadow-none rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Cantidad</TableHead>
            <TableHead className="text-right">Monto Total</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {data.map((r) => (
            <TableRow key={r.estado}>
              <TableCell>
                <Badge variant={r.estado === 'pagado' ? 'success' : r.estado === 'vencido' ? 'destructive' : 'gray'}>
                  {r.estado}
                </Badge>
              </TableCell>
              <TableCell className="text-center font-medium">{r.total}</TableCell>
              <TableCell className="text-right font-medium">S/ {Number(r.monto_total || 0).toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-gray-50 dark:bg-gray-700/30">
            <TableCell>Total</TableCell>
            <TableCell className="text-center">{data.reduce((s,r)=>s+r.total,0)}</TableCell>
            <TableCell className="text-right">S/ {total.toFixed(2)}</TableCell>
          </TableRow>
        </tbody>
      </Table>
    </div>
  );
}

/* ── Soporte ── */
function ReporteSoporte({ data }) {
  if (!data.length) return <Empty msg="No hay tickets registrados." />;
  const estadoBadge = { abierto: 'primary', en_proceso: 'secondary', resuelto: 'success', cerrado: 'gray' };
  return (
    <div className="p-4 space-y-6">
      <ReportePie data={data} labelKey="estado" valueKey="total" />
      <Table className="border-0 shadow-none rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Urgentes</TableHead>
            <TableHead className="text-center">Alta Prioridad</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {data.map((r) => (
            <TableRow key={r.estado}>
              <TableCell>
                <Badge variant={estadoBadge[r.estado] || 'gray'}>{r.estado.replace('_',' ')}</Badge>
              </TableCell>
              <TableCell className="text-center font-medium">{r.total}</TableCell>
              <TableCell className="text-center text-red-500 font-medium">{r.urgentes}</TableCell>
              <TableCell className="text-center text-amber-500 font-medium">{r.alta_prioridad}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

/* ── Componentes genéricos ── */
function ReporteBarras({ data, labelKey, valueKey, title }) {
  if (!data.length) return <Empty msg={`No hay datos de ${title}.`} />;
  return (
    <div className="p-4 space-y-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey={valueKey} name="Total" radius={[4,4,0,0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Table className="border-0 shadow-none rounded-none">
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead className="text-center">Total</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {data.map((r) => (
            <TableRow key={r[labelKey]}>
              <TableCell className="font-medium capitalize">{r[labelKey]}</TableCell>
              <TableCell className="text-center font-bold">{r[valueKey]}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function ReportePie({ data, labelKey, valueKey }) {
  if (!data.length) return <Empty msg="Sin datos." />;
  const total = data.reduce((s, r) => s + Number(r[valueKey] || 0), 0);
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey={labelKey} cx="50%" cy="50%" outerRadius={80} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((r, i) => (
            <div key={r[labelKey]} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="capitalize">{r[labelKey]}</span>
              </span>
              <span className="font-bold">{r[valueKey]} <span className="text-gray-400 font-normal">({total > 0 ? Math.round(r[valueKey]/total*100) : 0}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Empty({ msg }) {
  return <div className="p-12 text-center text-gray-400 text-sm">{msg}</div>;
}
