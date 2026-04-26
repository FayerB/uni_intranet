import { useState, useEffect } from 'react';

const MOCK_ALUMNOS = [
  { id: 1, name: 'Silva, Ana' },
  { id: 2, name: 'Ruiz, Carlos' },
  { id: 3, name: 'Méndez, Lucía' },
  { id: 4, name: 'Díaz, Marcos' },
  { id: 5, name: 'Castro, Sofia' },
  { id: 6, name: 'Gómez, Pedro' },
];

// Helper to generate an empty roster
const generateEmptyRoster = () => MOCK_ALUMNOS.map(a => ({ ...a, status: null }));

// Helper to generate a random past roster
const generateRandomRoster = () => {
  const statuses = ['presente', 'presente', 'presente', 'falta', 'tardanza'];
  return MOCK_ALUMNOS.map(a => ({
    ...a,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

// "Database" mock in memory
const attendanceDB = {};

export function useAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [alumnos, setAlumnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      if (!attendanceDB[currentDate]) {
        // If it's today, it starts empty. If it's a past date, mock random historical data
        const isToday = currentDate === new Date().toISOString().split('T')[0];
        attendanceDB[currentDate] = isToday ? generateEmptyRoster() : generateRandomRoster();
      }
      setAlumnos(attendanceDB[currentDate]);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [currentDate]);

  const markAttendance = (id, status) => {
    const updated = alumnos.map(a => (a.id === id ? { ...a, status } : a));
    setAlumnos(updated);
    attendanceDB[currentDate] = updated; // Save to "DB"
  };

  const markAll = (status) => {
    const updated = alumnos.map(a => ({ ...a, status }));
    setAlumnos(updated);
    attendanceDB[currentDate] = updated; // Save to "DB"
  };

  const changeDate = (newDateStr) => {
    setIsLoading(true);
    setCurrentDate(newDateStr);
  };

  const stats = {
    total: alumnos.length,
    presentes: alumnos.filter(a => a.status === 'presente').length,
    faltas: alumnos.filter(a => a.status === 'falta').length,
    tardanzas: alumnos.filter(a => a.status === 'tardanza').length,
  };

  return {
    currentDate,
    alumnos,
    stats,
    isLoading,
    markAttendance,
    markAll,
    changeDate,
  };
}
