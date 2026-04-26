import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Swal from 'sweetalert2';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const SCHEDULE = [
  { id: 1, day: 'Lunes', startHour: '08:00', span: 2, course: 'Matemática I', room: 'A-301', color: 'bg-primary/20 border-primary/30 text-primary-700 dark:text-primary-300' },
  { id: 2, day: 'Martes', startHour: '10:00', span: 3, course: 'Programación', room: 'Lab CC', color: 'bg-secondary/20 border-secondary/30 text-secondary-700 dark:text-secondary-300' },
  { id: 3, day: 'Miércoles', startHour: '08:00', span: 2, course: 'Matemática I', room: 'A-301', color: 'bg-primary/20 border-primary/30 text-primary-700 dark:text-primary-300' },
  { id: 4, day: 'Jueves', startHour: '14:00', span: 2, course: 'Física', room: 'B-102', color: 'bg-warning/20 border-warning/30 text-warning-700 dark:text-warning-300' },
  { id: 5, day: 'Viernes', startHour: '10:00', span: 2, course: 'Inglés', room: 'C-205', color: 'bg-success/20 border-success/30 text-success-700 dark:text-success-300' },
];

export default function HorariosPage() {
  const handleDownloadPdf = () => {
    Swal.fire({
      icon: 'info',
      title: 'Descarga simulada',
      text: 'La exportacion a PDF estara disponible en la siguiente iteracion.',
      confirmButtonColor: '#1e3a8a',
    });
  };

  const handleSyncCalendar = () => {
    Swal.fire({
      icon: 'success',
      title: 'Sincronizacion iniciada',
      text: 'Tu horario fue enviado a Google Calendar correctamente.',
      confirmButtonColor: '#1e3a8a',
    });
  };

  const getEventForSlot = (day, hour) => {
    return SCHEDULE.find(s => s.day === day && s.startHour === hour);
  };

  const isSlotCovered = (day, hour) => {
    return SCHEDULE.some(s => {
      if (s.day !== day) return false;
      const startIndex = HOURS.indexOf(s.startHour);
      const currentIndex = HOURS.indexOf(hour);
      return currentIndex > startIndex && currentIndex < startIndex + s.span;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <CalendarIcon className="mr-3 text-primary" size={28} />
            Mi Horario
          </h1>
          <p className="text-gray-500 mt-1">Revisa tu cronograma semanal de clases.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full sm:w-auto">
          <div className="flex flex-wrap justify-start sm:justify-end gap-2">
            <Button variant="outline" onClick={handleDownloadPdf}>
              Descargar PDF
            </Button>
            <Button onClick={handleSyncCalendar}>
              Sincronizar Google Calendar
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="overflow-x-auto pb-4"
      >
        <Card className="min-w-[800px]">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 font-medium text-center bg-gray-50 dark:bg-gray-800/50">
              <div className="p-4 border-r border-gray-100 dark:border-gray-700 text-gray-400">Hora</div>
              {DAYS.map(day => (
                <div key={day} className="p-4 border-r border-gray-100 dark:border-gray-700 last:border-0 text-gray-700 dark:text-gray-300">
                  {day}
                </div>
              ))}
            </div>

            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 last:border-0 relative h-20">
                <div className="border-r border-gray-100 dark:border-gray-700 p-2 text-center text-sm text-gray-500 flex items-center justify-center font-medium bg-gray-50/50 dark:bg-gray-800/30">
                  {hour}
                </div>
                
                {DAYS.map(day => {
                  const event = getEventForSlot(day, hour);
                  const covered = isSlotCovered(day, hour);
                  
                  if (covered) {
                    return <div key={`${day}-${hour}`} className="border-r border-gray-100 dark:border-gray-700 last:border-0" />;
                  }
                  
                  return (
                    <div key={`${day}-${hour}`} className="border-r border-gray-100 dark:border-gray-700 last:border-0 relative p-1">
                      {event && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          style={{ height: `calc(${event.span * 100}% + ${(event.span - 1) * 1}px)` }}
                          className={`absolute top-1 left-1 right-1 rounded-xl p-3 border shadow-sm z-10 flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${event.color}`}
                        >
                          <div>
                            <p className="font-bold text-sm line-clamp-2 leading-tight mb-1">{event.course}</p>
                            <p className="text-xs opacity-80 flex items-center mt-1">
                              <MapPin size={10} className="mr-1" />
                              {event.room}
                            </p>
                          </div>
                          <div className="text-[10px] uppercase font-bold opacity-70 flex items-center mt-2">
                            <Clock size={10} className="mr-1" />
                            {event.span} hrs
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}