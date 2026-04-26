import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Download, FileText } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { Button } from '../../components/ui/Button';
import Swal from 'sweetalert2';

const MOCK_NOTAS = [
  { id: 1, name: 'Silva, Ana', p1: 14, p2: 15, ep: 13, ef: 16 },
  { id: 2, name: 'Ruiz, Carlos', p1: 10, p2: 11, ep: 12, ef: 0 },
  { id: 3, name: 'Méndez, Lucía', p1: 18, p2: 17, ep: 19, ef: 18 },
  { id: 4, name: 'Díaz, Marcos', p1: 12, p2: 0, ep: 10, ef: 11 },
  { id: 5, name: 'Castro, Sofia', p1: 16, p2: 15, ep: 14, ef: 17 },
];

export default function NotasPage() {
  const [grades, setGrades] = useState(MOCK_NOTAS);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('Matemática I');

  const handleExport = () => {
    Swal.fire({
      icon: 'info',
      title: 'Exportacion preparada',
      text: `Se genero un archivo de notas para ${cursoSeleccionado}.`,
      confirmButtonColor: '#1e3a8a',
    });
  };

  const handleGradeChange = (id, field, value) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) numValue = 0;
    if (numValue < 0) numValue = 0;
    if (numValue > 20) numValue = 20;

    setGrades(prev => 
      prev.map(g => (g.id === id ? { ...g, [field]: numValue } : g))
    );
  };

  const calculateAverage = (g) => {
    // Logic: P1(15%) + P2(15%) + EP(30%) + EF(40%)
    const avg = (g.p1 * 0.15) + (g.p2 * 0.15) + (g.ep * 0.3) + (g.ef * 0.4);
    return Math.round(avg);
  };

  const handleSave = () => {
    Swal.fire({
      icon: 'success',
      title: 'Notas Guardadas',
      text: 'El registro de notas ha sido actualizado correctamente.',
      confirmButtonColor: '#1e3a8a',
    });
  };

  const getClassForGrade = (val) => {
    if (val >= 14) return 'text-primary font-bold dark:text-primary-400';
    if (val >= 11) return 'text-success font-bold dark:text-success';
    return 'text-destructive font-bold';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <FileText className="mr-3 text-primary" size={28} />
            Registro de Notas
          </h1>
          <p className="text-gray-500 mt-1">Ingresa y calcula los promedios de tus alumnos.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex" onClick={handleExport}>
            <Download size={18} className="mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={handleSave}>
            <Save size={18} className="mr-2" />
            Guardar Cambios
          </Button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-4">
          <label className="font-medium text-gray-700 dark:text-gray-300">Curso:</label>
          <select 
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:ring-primary w-64"
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
          >
            <option>Matemática I</option>
            <option>Introducción a la Programación</option>
            <option>Física General</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead className="w-24 text-center">Práctica 1 (15%)</TableHead>
              <TableHead className="w-24 text-center">Práctica 2 (15%)</TableHead>
              <TableHead className="w-24 text-center">Parcial (30%)</TableHead>
              <TableHead className="w-24 text-center">Final (40%)</TableHead>
              <TableHead className="w-24 text-center">Promedio</TableHead>
            </TableRow>
          </TableHeader>
          <tbody>
            {grades.map((student, i) => {
              const avg = calculateAverage(student);
              return (
                <motion.tr 
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-center">
                    <input 
                      type="number" min="0" max="20"
                      value={student.p1}
                      onChange={(e) => handleGradeChange(student.id, 'p1', e.target.value)}
                      className={`w-16 text-center border rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-900 border-gray-200 dark:border-gray-600 ${getClassForGrade(student.p1)}`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input 
                      type="number" min="0" max="20"
                      value={student.p2}
                      onChange={(e) => handleGradeChange(student.id, 'p2', e.target.value)}
                      className={`w-16 text-center border rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-900 border-gray-200 dark:border-gray-600 ${getClassForGrade(student.p2)}`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input 
                      type="number" min="0" max="20"
                      value={student.ep}
                      onChange={(e) => handleGradeChange(student.id, 'ep', e.target.value)}
                      className={`w-16 text-center border rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-900 border-gray-200 dark:border-gray-600 ${getClassForGrade(student.ep)}`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <input 
                      type="number" min="0" max="20"
                      value={student.ef}
                      onChange={(e) => handleGradeChange(student.id, 'ef', e.target.value)}
                      className={`w-16 text-center border rounded-lg py-1 px-2 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-900 border-gray-200 dark:border-gray-600 ${getClassForGrade(student.ef)}`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`text-lg px-3 py-1 rounded-lg inline-block shadow-sm ${avg >= 14 ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300' : avg >= 11 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {avg < 10 ? `0${avg}` : avg}
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </tbody>
        </Table>
      </motion.div>
    </div>
  );
}
