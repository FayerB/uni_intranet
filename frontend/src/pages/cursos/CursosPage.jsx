import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Search, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/tables/Table';
import { X, CheckCircle, Presentation } from 'lucide-react';

const MOCK_CURSOS = [
  { id: 1, code: 'CS101', name: 'Introducción a la Programación', credits: 4, ciclo: 'I', students: 45, type: 'Obligatorio', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80' },
  { id: 2, code: 'MAT201', name: 'Cálculo Diferencial', credits: 5, ciclo: 'II', students: 38, type: 'Obligatorio', image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=300&q=80' },
  { id: 3, code: 'DB301', name: 'Bases de Datos I', credits: 4, ciclo: 'III', students: 42, type: 'Obligatorio', image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=300&q=80' },
  { id: 4, code: 'ENG101', name: 'Inglés Técnico', credits: 3, ciclo: 'I', students: 50, type: 'Electivo', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=300&q=80' },
  { id: 5, code: 'AI401', name: 'Inteligencia Artificial', credits: 4, ciclo: 'IV', students: 30, type: 'Especialidad', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80' },
];

export default function CursosPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [cicloFilter, setCicloFilter] = useState('Todos');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filteredCursos = MOCK_CURSOS.filter(curso => {
    const matchesSearch = curso.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          curso.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCiclo = cicloFilter === 'Todos' || curso.ciclo === cicloFilter;
    return matchesSearch && matchesCiclo;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cursos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Explora y gestiona los cursos académicos.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 font-medium rounded-lg transition-colors flex items-center ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 font-medium rounded-lg transition-colors flex items-center ${viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1">
          <Input 
            placeholder="Buscar por código o nombre..." 
            icon={Search} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-48"
            value={cicloFilter}
            onChange={(e) => setCicloFilter(e.target.value)}
          >
            <option value="Todos">Todos los ciclos</option>
            <option value="I">Ciclo I</option>
            <option value="II">Ciclo II</option>
            <option value="III">Ciclo III</option>
            <option value="IV">Ciclo IV</option>
          </select>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCursos.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <p className="text-gray-500 dark:text-gray-400">No se encontraron cursos con los filtros actuales.</p>
              </div>
            )}
            {filteredCursos.map((curso, i) => (
              <motion.div key={curso.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className="h-full flex flex-col">
                  <div className="h-48 overflow-hidden rounded-t-2xl relative">
                    <img src={curso.image} alt={curso.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    <div className="absolute top-3 left-3">
                      <Badge variant={curso.type === 'Obligatorio' ? 'primary' : 'warning'}>{curso.type}</Badge>
                    </div>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-5">
                    <div className="text-xs font-semibold text-primary mb-2">{curso.code}</div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">{curso.name}</h3>
                    
                    <div className="mt-auto space-y-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <BookOpen size={16} className="mr-2" />
                        {curso.credits} Créditos
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock size={16} className="mr-2" />
                        Ciclo {curso.ciclo}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users size={16} className="mr-2" />
                        {curso.students} Estudiantes
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedCourse(curso)}
                      className="mt-4 flex items-center justify-between text-sm font-medium text-primary hover:text-primary-600 transition-colors w-full"
                    >
                      Ver detalles
                      <ArrowRight size={16} />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="table"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead className="text-right">Alumnos</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filteredCursos.length === 0 && (
                  <tr>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No se encontraron cursos con los filtros actuales.
                    </TableCell>
                  </tr>
                )}
                {filteredCursos.map((curso, i) => (
                  <motion.tr 
                    key={curso.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <TableCell className="font-medium text-primary">{curso.code}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900 dark:text-white">{curso.name}</span>
                    </TableCell>
                    <TableCell>Ciclo {curso.ciclo}</TableCell>
                    <TableCell>
                      <Badge variant={curso.type === 'Obligatorio' ? 'primary' : 'warning'}>{curso.type}</Badge>
                    </TableCell>
                    <TableCell>{curso.credits}</TableCell>
                    <TableCell className="text-right font-medium">{curso.students}</TableCell>
                  </motion.tr>
                ))}
              </tbody>
            </Table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Details Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedCourse(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-48 relative shrink-0">
                <img src={selectedCourse.image} alt={selectedCourse.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <button 
                  onClick={() => setSelectedCourse(null)} 
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-6 pr-6">
                  <Badge variant={selectedCourse.type === 'Obligatorio' ? 'primary' : 'warning'} className="mb-2 shadow-lg backdrop-blur-md bg-white/20 border-white/10 text-white">
                    {selectedCourse.type}
                  </Badge>
                  <h2 className="text-2xl font-bold text-white mb-1 shadow-black">{selectedCourse.name}</h2>
                  <p className="text-white/80 font-medium">{selectedCourse.code}</p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-2xl flex flex-col items-center">
                    <BookOpen className="text-primary mb-2" size={24} />
                    <span className="text-sm text-gray-500">Créditos</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedCourse.credits} pts</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-2xl flex flex-col items-center">
                    <Clock className="text-secondary mb-2" size={24} />
                    <span className="text-sm text-gray-500">Ciclo</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedCourse.ciclo}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-2xl flex flex-col items-center">
                    <Users className="text-success mb-2" size={24} />
                    <span className="text-sm text-gray-500">Alumnos</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedCourse.students} inscritos</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Sílabo General</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="text-success mt-0.5 mr-3 shrink-0" size={18} />
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Fundamentos teóricos y conceptualización general de las bases metodológicas.</p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="text-success mt-0.5 mr-3 shrink-0" size={18} />
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Desarrollo de proyectos colaborativos en el entorno digital de aprendizaje.</p>
                    </div>
                    <div className="flex items-start">
                      <Presentation className="text-gray-400 mt-0.5 mr-3 shrink-0" size={18} />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Exposición final de sustento y resultados de experimentación.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
