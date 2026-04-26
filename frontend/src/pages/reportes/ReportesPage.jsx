import { motion } from 'framer-motion';
import { 
  BarChart4, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  PieChart as PieChartIcon 
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import Swal from 'sweetalert2';

const MOCK_DATA = [
  { id: 1, curso: 'Matemática I', matriculados: 45, aprobados: 38, desaprobados: 7, promedio: 14.5 },
  { id: 2, curso: 'Física I', matriculados: 42, aprobados: 30, desaprobados: 12, promedio: 12.8 },
  { id: 3, curso: 'Programación', matriculados: 50, aprobados: 48, desaprobados: 2, promedio: 16.2 },
  { id: 4, curso: 'Inglés', matriculados: 35, aprobados: 34, desaprobados: 1, promedio: 17.5 },
];

export default function ReportesPage() {
  const showExportMessage = (type) => {
    Swal.fire({
      icon: 'success',
      title: `${type} generado`,
      text: `El reporte fue preparado en formato ${type}.`,
      confirmButtonColor: '#1e3a8a',
    });
  };

  const showChartsMessage = () => {
    Swal.fire({
      icon: 'info',
      title: 'Panel de graficos',
      text: 'La vista avanzada estara habilitada en la proxima version.',
      confirmButtonColor: '#1e3a8a',
    });
  };

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
        {/* Panel de Filtros */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-6"
        >
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 font-semibold flex items-center">
              <Filter size={18} className="mr-2 text-primary" />
              Filtros Avanzados
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tipo de Reporte</label>
                <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-primary focus:border-primary">
                  <option>Rendimiento Académico</option>
                  <option>Matrículas por Facultad</option>
                  <option>Asistencia General</option>
                  <option>Ingresos Financieros</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Ciclo Académico</label>
                <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-primary focus:border-primary">
                  <option>2026-I</option>
                  <option>2025-II</option>
                  <option>2025-I</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Facultad</label>
                <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-primary focus:border-primary">
                  <option>Todas las facultades</option>
                  <option>Ingeniería</option>
                  <option>Ciencias de la Salud</option>
                  <option>Negocios</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button className="w-full">Generar Reporte</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Panel de Resultados */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Tarjetas de Exportación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card hover className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 group shadow-lg shadow-green-500/20">
              <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
                <FileSpreadsheet size={32} className="mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-1">Exportar Excel</h3>
                <p className="text-xs text-green-100">Formato .xlsx con todos los datos</p>
                <Button
                  variant="ghost"
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20"
                  onClick={() => showExportMessage('Excel')}
                >
                  Descargar
                </Button>
              </CardContent>
            </Card>
            <Card hover className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 group shadow-lg shadow-red-500/20">
              <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
                <FileText size={32} className="mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-1">Exportar PDF</h3>
                <p className="text-xs text-red-100">Documento formateado para impresión</p>
                <Button
                  variant="ghost"
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20"
                  onClick={() => showExportMessage('PDF')}
                >
                  Descargar
                </Button>
              </CardContent>
            </Card>
            <Card hover className="bg-gradient-to-br from-primary to-indigo-600 text-white border-0 group shadow-lg shadow-primary/20">
              <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
                <PieChartIcon size={32} className="mb-3 opacity-90 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold mb-1">Ver Gráficos</h3>
                <p className="text-xs text-indigo-100">Dashboards interactivos detallados</p>
                <Button
                  variant="ghost"
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20"
                  onClick={showChartsMessage}
                >
                  Abrir panel
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-2xl">
              <h3 className="font-semibold text-gray-900 dark:text-white">Vista Previa: Rendimiento Académico</h3>
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">Actualizado hace 5 min</span>
            </div>
            <CardContent className="p-0">
              <Table className="border-0 rounded-none rounded-b-2xl shadow-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead className="text-center">Matriculados</TableHead>
                    <TableHead className="text-center">Aprobados</TableHead>
                    <TableHead className="text-center">Desaprobados</TableHead>
                    <TableHead className="text-center">Promedio Gral.</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {MOCK_DATA.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-gray-900 dark:text-white">{row.curso}</TableCell>
                      <TableCell className="text-center">{row.matriculados}</TableCell>
                      <TableCell className="text-center text-success font-medium">{row.aprobados}</TableCell>
                      <TableCell className="text-center text-destructive font-medium">{row.desaprobados}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${row.promedio >= 14 ? 'bg-primary/10 text-primary' : row.promedio >= 11 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {row.promedio}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
