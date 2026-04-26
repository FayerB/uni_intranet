import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, BookOpen, User, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Swal from 'sweetalert2';

const STEPS = [
  { id: 1, title: 'Datos Personales', icon: User },
  { id: 2, title: 'Selección de Cursos', icon: BookOpen },
  { id: 3, title: 'Confirmación', icon: CreditCard },
];

const CURSOS_DISPONIBLES = [
  { id: 1, code: 'CS101', name: 'Intro a la Programación', credits: 4 },
  { id: 2, code: 'MAT201', name: 'Cálculo Diferencial', credits: 5 },
  { id: 3, code: 'DB301', name: 'Bases de Datos I', credits: 4 },
  { id: 4, code: 'ENG101', name: 'Inglés Técnico', credits: 3 },
  { id: 5, code: 'FIS101', name: 'Física General', credits: 4 },
];

export default function MatriculasPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [notificationEmail, setNotificationEmail] = useState('juan@universidad.edu');
  
  const handleNext = () => {
    if (currentStep === 1 && !/^\S+@\S+\.\S+$/i.test(notificationEmail)) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo invalido',
        text: 'Ingresa un correo valido para continuar.',
        confirmButtonColor: '#1e3a8a',
      });
      return;
    }
    if (currentStep === 2 && selectedIndices.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Selecciona al menos un curso',
        text: 'Debes elegir un curso antes de pasar al resumen.',
        confirmButtonColor: '#1e3a8a',
      });
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };
  
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const toggleCurso = (id) => {
    if (selectedIndices.includes(id)) {
      setSelectedIndices(selectedIndices.filter(i => i !== id));
    } else {
      setSelectedIndices([...selectedIndices, id]);
    }
  };

  const selectedCursos = CURSOS_DISPONIBLES.filter(c => selectedIndices.includes(c.id));
  const totalCredits = selectedCursos.reduce((acc, curr) => acc + curr.credits, 0);

  const handleConfirm = () => {
    Swal.fire({
      icon: 'success',
      title: '¡Matrícula Exitosa!',
      text: `Te has matriculado en ${selectedCursos.length} cursos (${totalCredits} créditos).`,
      confirmButtonColor: '#1e3a8a',
      customClass: { popup: 'rounded-2xl' }
    }).then(() => {
      // Reset wizard
      setCurrentStep(1);
      setSelectedIndices([]);
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proceso de Matrícula</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Ciclo Académico 2026-I</p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        <div className="relative z-10 flex justify-between">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                    ${isCompleted ? 'bg-primary text-white scale-95' : 
                      isCurrent ? 'bg-primary border-4 border-white dark:border-gray-900 text-white scale-110 shadow-premium' : 
                      'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400'}`}
                >
                  {isCompleted ? <Check size={20} /> : <step.icon size={20} />}
                </div>
                <span className={`mt-3 text-sm font-medium transition-colors duration-300
                  ${isCurrent ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <Card className="min-h-[400px] flex flex-col">
        <CardContent className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-xl mx-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verifica tus datos</h2>
                  <p className="text-gray-500 text-sm mt-1">Asegúrate de que tu información esté actualizada.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres Fijos</label>
                    <input disabled value="Juan Carlos" className="w-full bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos Fijos</label>
                    <input disabled value="Pérez Gómez" className="w-full bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico a notificar</label>
                    <input
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Selecciona tus cursos</h2>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    Créditos: {totalCredits} / 22
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CURSOS_DISPONIBLES.map(curso => {
                    const isSelected = selectedIndices.includes(curso.id);
                    return (
                      <div 
                        key={curso.id}
                        onClick={() => toggleCurso(curso.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between
                          ${isSelected 
                            ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                            : 'border-gray-100 dark:border-gray-700 hover:border-primary/50'}`}
                      >
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{curso.name}</div>
                          <div className="text-sm text-gray-500">{curso.code} • {curso.credits} créditos</div>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-primary text-white' : 'border-2 border-gray-300 dark:border-gray-600'}`}>
                          {isSelected && <Check size={14} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen de Matrícula</h2>
                  <p className="text-gray-500 mt-1">Revisa que todo esté correcto antes de confirmar.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cursos Seleccionados</h3>
                  
                  {selectedCursos.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-4">No has seleccionado ningún curso.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCursos.map(c => (
                        <div key={c.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{c.code} - {c.name}</span>
                          <span className="text-gray-500">{c.credits} cr.</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 font-bold text-lg">
                        <span className="text-gray-900 dark:text-white">Total Créditos</span>
                        <span className="text-primary">{totalCredits}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
          <Button 
            variant="outline" 
            onClick={handlePrev} 
            disabled={currentStep === 1}
          >
            <ChevronLeft size={18} className="mr-2" />
            Anterior
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Siguiente
              <ChevronRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleConfirm}
              disabled={selectedCursos.length === 0}
            >
              Confirmar Matrícula
              <Check size={18} className="ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
