import { useState, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         isSameDay, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { getEventos } from '../../api/calendario';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../context/useStore';

const TIPO_COLOR = {
  academico:     '#3B82F6',
  tarea:         '#F59E0B',
  examen:        '#EF4444',
  clase_virtual: '#10B981',
  feriado:       '#8B5CF6',
  otro:          '#6B7280',
};

export default function CalendarioPage() {
  const { user } = useStore();
  const [mes, setMes] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const desde = format(startOfMonth(mes), 'yyyy-MM-dd');
    const hasta  = format(endOfMonth(mes),   'yyyy-MM-dd');
    setLoading(true);
    getEventos({ desde, hasta })
      .then(({ data }) => setEventos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mes]);

  const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
  const fin    = endOfWeek(endOfMonth(mes),     { weekStartsOn: 1 });
  const dias   = eachDayOfInterval({ start: inicio, end: fin });

  const eventosDelDia = (dia) => eventos.filter((e) => isSameDay(new Date(e.fecha_inicio), dia));
  const eventosSeleccionados = seleccionado ? eventosDelDia(seleccionado) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="text-blue-600" size={26} />
          Calendario Académico
        </h1>
        {['admin', 'docente'].includes(user?.role) && (
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Nuevo evento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-2">
          {/* Nav mes */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMes(subMonths(mes, 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-semibold text-gray-900 dark:text-white capitalize">
              {format(mes, 'MMMM yyyy', { locale: es })}
            </h2>
            <button onClick={() => setMes(addMonths(mes, 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 mb-2">
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Días */}
          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia) => {
              const evs = eventosDelDia(dia);
              const activo = seleccionado && isSameDay(dia, seleccionado);
              return (
                <button
                  key={dia.toISOString()}
                  onClick={() => setSeleccionado(isSameDay(dia, seleccionado) ? null : dia)}
                  className={`min-h-[52px] p-1 rounded-lg text-left transition-colors ${
                    !isSameMonth(dia, mes) ? 'opacity-30' : ''
                  } ${
                    activo ? 'bg-blue-100 dark:bg-blue-900/40' :
                    isToday(dia) ? 'bg-blue-50 dark:bg-blue-950/30' :
                    'hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <span className={`text-xs font-medium block text-center ${
                    isToday(dia) ? 'text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {format(dia, 'd')}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {evs.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className="text-[10px] truncate px-1 py-0.5 rounded text-white font-medium"
                        style={{ backgroundColor: e.color || TIPO_COLOR[e.tipo] || '#3B82F6' }}
                      >
                        {e.titulo}
                      </div>
                    ))}
                    {evs.length > 2 && (
                      <div className="text-[9px] text-gray-400 text-center">+{evs.length - 2} más</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Leyenda */}
          <Card>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-3">Tipos de eventos</h3>
            <div className="space-y-2">
              {Object.entries(TIPO_COLOR).map(([tipo, color]) => (
                <div key={tipo} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="capitalize">{tipo.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Eventos del día seleccionado */}
          {seleccionado && (
            <Card>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-3">
                {format(seleccionado, "d 'de' MMMM", { locale: es })}
              </h3>
              {eventosSeleccionados.length === 0 ? (
                <p className="text-xs text-gray-400">Sin eventos este día</p>
              ) : (
                <div className="space-y-3">
                  {eventosSeleccionados.map((e) => (
                    <div key={e.id} className="flex gap-3">
                      <div
                        className="w-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: e.color || TIPO_COLOR[e.tipo] }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{e.titulo}</p>
                        {e.descripcion && (
                          <p className="text-xs text-gray-400 mt-0.5">{e.descripcion}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {e.todo_el_dia ? 'Todo el día' : format(new Date(e.fecha_inicio), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Próximos eventos */}
          <Card>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-3">Próximos eventos</h3>
            <div className="space-y-2">
              {eventos
                .filter((e) => new Date(e.fecha_inicio) >= new Date())
                .slice(0, 5)
                .map((e) => (
                  <div key={e.id} className="flex gap-2 items-start">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: e.color || TIPO_COLOR[e.tipo] }}
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{e.titulo}</p>
                      <p className="text-[11px] text-gray-400">
                        {format(new Date(e.fecha_inicio), "d MMM HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
