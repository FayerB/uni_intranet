import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart4, Filter, FileSpreadsheet, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { Badge } from '../../components/ui/Badge';
import Swal from 'sweetalert2';
import api from '../../api';

const REPORT_TYPES = ['Usuarios por Rol', 'Noticias por Categoría'];

export default function ReportesPage() {
  const [resumen, setResumen]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tipoReporte, setTipoReporte] = useState('Usuarios por Rol');

  useEffect(() => {
    api.get('/reportes/resumen')
      .then((res) => setResumen(res.data))
      .catch(() => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el reporte.', confirmButtonColor: '#1e3a8a' });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const showExportMessage = (type) => {
    Swal.fire({ icon: 'success', title: `${type} generado`, text: `El reporte fue preparado en formato ${type}.`, confirmButtonColor: '#1e3a8a' });
  };

  const rolBadge = { admin: 'primary', docente: 'secondary', estudiante: 'success' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart4 className="mr-3 text-primary" size={28} />
            Centro de Reportes
          </h1>
          <p className="text-gray-500 mt-1">Genera y exporta estadísticas académicas e institucionales.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 font-semibold flex items-center">
              <Filter size={18} className="mr-2 text-primary" />
              Filtros
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tipo de Reporte</label>
                <select
                  value={tipoReporte}
                  onChange={(e) => setTipoReporte(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-primary focus:border-primary"
                >
                  {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button className="w-full" onClick={() => window.location.reload()}>
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resultados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Exportación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card hover className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 group shadow-lg shadow-green-500/20">
              <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
                <FileSpreadsheet size={32} className="mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-1">Exportar Excel</h3>
                <p className="text-xs text-green-100">Formato .xlsx con todos los datos</p>
                <Button variant="ghost" className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20" onClick={() => showExportMessage('Excel')}>
                  Descargar
                </Button>
              </CardContent>
            </Card>
            <Card hover className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 group shadow-lg shadow-red-500/20">
              <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
                <FileText size={32} className="mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-1">Exportar PDF</h3>
                <p className="text-xs text-red-100">Documento formateado para impresión</p>
                <Button variant="ghost" className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20" onClick={() => showExportMessage('PDF')}>
                  Descargar
                </Button>
              </CardContent>
            </Card>
            <Card hover className="bg-gradient-to-br from-primary to-indigo-600 text-white border-0 group shadow-lg shadow-primary/20">
              <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
                <PieChartIcon size={32} className="mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-1">Ver Gráficos</h3>
                <p className="text-xs text-indigo-100">Dashboards interactivos detallados</p>
                <Button variant="ghost" className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20" onClick={() => Swal.fire({ icon: 'info', title: 'Próximamente', text: 'La vista avanzada estará habilitada en la próxima versión.', confirmButtonColor: '#1e3a8a' })}>
                  Abrir panel
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tabla dinámica */}
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-2xl">
              <h3 className="font-semibold text-gray-900 dark:text-white">{tipoReporte}</h3>
              {!isLoading && (
                <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                  Datos en tiempo real
                </span>
              )}
            </div>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-gray-400">Cargando reporte...</div>
              ) : tipoReporte === 'Usuarios por Rol' ? (
                <Table className="border-0 rounded-none rounded-b-2xl shadow-none">
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
                    {(resumen?.usuarios ?? []).map((row) => {
                      const pct = row.total > 0 ? Math.round((row.activos / row.total) * 100) : 0;
                      return (
                        <TableRow key={row.rol}>
                          <TableCell>
                            <Badge variant={rolBadge[row.rol] || 'gray'}>
                              {row.rol.charAt(0).toUpperCase() + row.rol.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-medium">{row.total}</TableCell>
                          <TableCell className="text-center text-success font-medium">{row.activos}</TableCell>
                          <TableCell className="text-center text-destructive font-medium">{row.inactivos}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${pct >= 80 ? 'bg-primary/10 text-primary' : pct >= 50 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                              {pct}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <Table className="border-0 rounded-none rounded-b-2xl shadow-none">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Publicadas</TableHead>
                      <TableHead className="text-center">Ocultas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {(resumen?.noticias ?? []).map((row) => (
                      <TableRow key={row.categoria}>
                        <TableCell className="font-medium text-gray-900 dark:text-white">{row.categoria}</TableCell>
                        <TableCell className="text-center font-medium">{row.total}</TableCell>
                        <TableCell className="text-center text-success font-medium">{row.publicadas}</TableCell>
                        <TableCell className="text-center text-destructive font-medium">{row.ocultas}</TableCell>
                      </TableRow>
                    ))}
                    {(resumen?.noticias ?? []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                          No hay noticias registradas.
                        </TableCell>
                      </TableRow>
                    )}
                  </tbody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
