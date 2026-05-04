// Datos de demostración usados cuando el backend no está disponible.
// Cada clave corresponde a un endpoint del sistema.

const cursos = [
  { id: 1, code: 'CS101', name: 'Introducción a la Programación', description: 'Fundamentos de programación con Python.', credits: 4, ciclo: 'I', type: 'Obligatorio', students: 28, docente: 'Prof. García', image: null },
  { id: 2, code: 'MAT201', name: 'Cálculo Diferencial',           description: 'Límites, derivadas e integrales.', credits: 4, ciclo: 'II', type: 'Obligatorio', students: 35, docente: 'Prof. López',  image: null },
  { id: 3, code: 'ENG301', name: 'Inglés Técnico',                description: 'Inglés aplicado al entorno profesional.', credits: 2, ciclo: 'III', type: 'Electivo',    students: 20, docente: 'Prof. Smith',  image: null },
  { id: 4, code: 'FIS102', name: 'Física General',                description: 'Mecánica, termodinámica y electromagnetismo.', credits: 4, ciclo: 'II', type: 'Obligatorio', students: 30, docente: 'Prof. Ramos',  image: null },
  { id: 5, code: 'BD401',  name: 'Bases de Datos',                description: 'Diseño relacional, SQL y NoSQL.', credits: 3, ciclo: 'IV', type: 'Especialidad', students: 22, docente: 'Prof. Torres', image: null },
];

const matriculas = [
  { id: 1, curso_id: 1, curso: 'Introducción a la Programación', codigo: 'CS101', creditos: 4, estado: 'activo',  estudiante: 'Demo Estudiante' },
  { id: 2, curso_id: 2, curso: 'Cálculo Diferencial',            codigo: 'MAT201', creditos: 4, estado: 'activo',  estudiante: 'Demo Estudiante' },
  { id: 3, curso_id: 3, curso: 'Inglés Técnico',                 codigo: 'ENG301', creditos: 2, estado: 'activo',  estudiante: 'Demo Estudiante' },
];

const notas = [
  { estudianteId: 1, name: 'Ana Torres',   p1: 16, p2: 15, ep: 17, ef: 18 },
  { estudianteId: 2, name: 'Carlos Ruiz',  p1: 12, p2: 11, ep: 13, ef: 12 },
  { estudianteId: 3, name: 'María Soto',   p1: 19, p2: 18, ep: 20, ef: 19 },
  { estudianteId: 4, name: 'Luis Mendoza', p1: 8,  p2: 9,  ep: 8,  ef: 10 },
  { estudianteId: 5, name: 'Sara Díaz',    p1: 15, p2: 16, ep: 14, ef: 17 },
];

const asistencias = [
  { estudianteId: 1, name: 'Ana Torres',   estado: 'presente' },
  { estudianteId: 2, name: 'Carlos Ruiz',  estado: 'falta'    },
  { estudianteId: 3, name: 'María Soto',   estado: 'presente' },
  { estudianteId: 4, name: 'Luis Mendoza', estado: 'tardanza' },
  { estudianteId: 5, name: 'Sara Díaz',    estado: 'presente' },
];

const dashboardStats = {
  totalUsuarios: 128,
  usuariosPorRol: [
    { rol: 'admin',      cantidad: 3   },
    { rol: 'docente',    cantidad: 25  },
    { rol: 'estudiante', cantidad: 100 },
  ],
  noticiasPublicadas: 14,
  chartData: [
    { name: 'Nov', noticias: 4, usuarios: 12 },
    { name: 'Dic', noticias: 6, usuarios: 20 },
    { name: 'Ene', noticias: 3, usuarios: 15 },
    { name: 'Feb', noticias: 8, usuarios: 30 },
    { name: 'Mar', noticias: 5, usuarios: 22 },
    { name: 'Abr', noticias: 9, usuarios: 28 },
  ],
};

const usuarios = [
  { id: 1, name: 'Admin Demo',     initial: 'A', email: 'admin@uni.edu',     role: 'admin',      status: 'Activo' },
  { id: 2, name: 'García Docente', initial: 'G', email: 'garcia@uni.edu',    role: 'docente',    status: 'Activo' },
  { id: 3, name: 'Ana Torres',     initial: 'A', email: 'ana@uni.edu',       role: 'estudiante', status: 'Activo' },
  { id: 4, name: 'Carlos Ruiz',    initial: 'C', email: 'carlos@uni.edu',    role: 'estudiante', status: 'Activo' },
];

const notificaciones = [
  { id: 1, tipo: 'clase',     titulo: 'Clase en vivo ahora',        mensaje: 'La clase de Introducción a Python comenzó.', fecha: '2026-04-27T10:00:00', leida: false },
  { id: 2, tipo: 'nota',      titulo: 'Notas publicadas',           mensaje: 'El docente publicó las notas de Cálculo Diferencial.', fecha: '2026-04-27T09:00:00', leida: false },
  { id: 3, tipo: 'matricula', titulo: 'Matrícula confirmada',        mensaje: 'Te matriculaste en Inglés Técnico exitosamente.', fecha: '2026-04-26T14:00:00', leida: true },
  { id: 4, tipo: 'asistencia',titulo: 'Falta registrada',           mensaje: 'Se registró una falta en Física General el 20/04.', fecha: '2026-04-25T08:30:00', leida: true },
  { id: 5, tipo: 'sistema',   titulo: 'Bienvenido al sistema',      mensaje: 'Tu cuenta ha sido activada correctamente.', fecha: '2026-04-20T12:00:00', leida: true },
];

const materiales = [
  { id: 1, curso_id: 1, titulo: 'Guía de Python — Semana 1',      tipo: 'pdf',   enlace: '#', tamaño: '2.3 MB', fecha: '2026-04-20', docente: 'Prof. García' },
  { id: 2, curso_id: 1, titulo: 'Ejercicios de Variables',        tipo: 'pdf',   enlace: '#', tamaño: '1.1 MB', fecha: '2026-04-22', docente: 'Prof. García' },
  { id: 3, curso_id: 1, titulo: 'Clase grabada — Semana 1',      tipo: 'video', enlace: 'https://youtube.com', tamaño: null, fecha: '2026-04-21', docente: 'Prof. García' },
  { id: 4, curso_id: 2, titulo: 'Teoría de Límites',              tipo: 'pdf',   enlace: '#', tamaño: '3.5 MB', fecha: '2026-04-19', docente: 'Prof. López' },
  { id: 5, curso_id: 2, titulo: 'Ejercicios resueltos Semana 2', tipo: 'doc',   enlace: '#', tamaño: '980 KB', fecha: '2026-04-23', docente: 'Prof. López' },
  { id: 6, curso_id: 3, titulo: 'Vocabulario — Unit 1',           tipo: 'link',  enlace: 'https://quizlet.com', tamaño: null, fecha: '2026-04-18', docente: 'Prof. Smith' },
];

const historialAcademico = {
  resumen: { totalCreditos: 13, promedioPonderado: 14.1, ciclosCompletados: 2 },
  ciclos: [
    {
      ciclo: '2025-I',
      promedio: 15.2,
      creditosAprobados: 7,
      cursos: [
        { nombre: 'Matemáticas Básicas', codigo: 'MAT101', creditos: 4, nota: 16, estado: 'Aprobado' },
        { nombre: 'Comunicación',        codigo: 'COM101', creditos: 3, nota: 14, estado: 'Aprobado' },
      ],
    },
    {
      ciclo: '2025-II',
      promedio: 13.0,
      creditosAprobados: 6,
      cursos: [
        { nombre: 'Cálculo Diferencial', codigo: 'MAT201', creditos: 4, nota: 13, estado: 'Aprobado' },
        { nombre: 'Física General',      codigo: 'FIS102', creditos: 4, nota: 9,  estado: 'Desaprobado' },
        { nombre: 'Inglés Técnico',      codigo: 'ENG301', creditos: 2, nota: 17, estado: 'Aprobado' },
      ],
    },
  ],
};

const reportesResumen = {
  usuarios: [
    { rol: 'admin',      total: 3,   activos: 3,  inactivos: 0 },
    { rol: 'docente',    total: 25,  activos: 23, inactivos: 2 },
    { rol: 'estudiante', total: 100, activos: 92, inactivos: 8 },
  ],
  noticias: [
    { categoria: 'Académica',     total: 8, publicadas: 7, ocultas: 1 },
    { categoria: 'Institucional', total: 4, publicadas: 4, ocultas: 0 },
    { categoria: 'Deportes',      total: 3, publicadas: 2, ocultas: 1 },
  ],
};

const clasesVirtuales = [
  { id: 1, curso_id: 1, docente_id: 2, titulo: 'Clase 01 — Introducción a Python', descripcion: 'Variables, tipos de datos y operadores básicos.', enlace: 'https://meet.google.com/demo-cs101', fecha_hora: '2026-04-28T10:00:00', estado: 'programada', docente: 'Prof. García', curso: 'Introducción a la Programación' },
  { id: 2, curso_id: 1, docente_id: 2, titulo: 'Clase 02 — Estructuras de control', descripcion: 'If, for, while y manejo de errores.', enlace: 'https://meet.google.com/demo-cs101-2', fecha_hora: '2026-04-27T10:00:00', estado: 'en_vivo', docente: 'Prof. García', curso: 'Introducción a la Programación' },
  { id: 3, curso_id: 2, docente_id: 2, titulo: 'Límites y continuidad', descripcion: 'Definición formal de límite y ejercicios resueltos.', enlace: 'https://zoom.us/j/demo-mat201', fecha_hora: '2026-04-25T08:00:00', estado: 'finalizada', docente: 'Prof. López', curso: 'Cálculo Diferencial' },
  { id: 4, curso_id: 3, docente_id: 2, titulo: 'Business English — Unit 1', descripcion: 'Vocabulario técnico y presentaciones profesionales.', enlace: 'https://meet.google.com/demo-eng301', fecha_hora: '2026-04-30T15:00:00', estado: 'programada', docente: 'Prof. Smith', curso: 'Inglés Técnico' },
  { id: 5, curso_id: 4, docente_id: 2, titulo: 'Mecánica Newtoniana', descripcion: 'Leyes del movimiento y dinámica de partículas.', enlace: 'https://zoom.us/j/demo-fis102', fecha_hora: '2026-04-20T09:00:00', estado: 'cancelada', docente: 'Prof. Ramos', curso: 'Física General' },
];

const foros = [
  { id: 1, titulo: 'Dudas sobre Python — Semana 1', descripcion: 'Espacio para resolver dudas de la primera semana.', curso: 'Introducción a la Programación', hilos: 5 },
  { id: 2, titulo: 'Problemas de Cálculo Diferencial', descripcion: 'Comparte y resuelve ejercicios de cálculo.', curso: 'Cálculo Diferencial', hilos: 3 },
  { id: 3, titulo: 'Foro General', descripcion: 'Temas generales de la institución.', curso: 'General', hilos: 8 },
];

const hilos = [
  { id: 1, titulo: '¿Cómo funciona un bucle while?', contenido: 'Tengo dudas sobre la condición de parada.', autor: 'Carlos Pérez', fijado: false, respuestas: 4, created_at: '2026-04-25T10:00:00' },
  { id: 2, titulo: 'Error en mi código de listas', contenido: 'Me sale IndexError al recorrer la lista.', autor: 'Ana Torres', fijado: true, respuestas: 2, created_at: '2026-04-26T09:00:00' },
];

const conversaciones = [
  { id: 1, nombre: 'Prof. García', rol: 'docente', ultimo_mensaje: 'Recuerda entregar la tarea.', no_leidos: 2 },
  { id: 2, nombre: 'Ana Torres', rol: 'estudiante', ultimo_mensaje: '¿Tienes los apuntes?', no_leidos: 0 },
  { id: 3, nombre: 'Admin Sistema', rol: 'admin', ultimo_mensaje: 'Tu cuenta fue activada.', no_leidos: 1 },
];

const mensajes = [
  { id: 1, contenido: 'Hola, ¿cómo estás?', remitente: 'Prof. García', remitente_id: 2, created_at: '2026-04-27T09:00:00', propio: false },
  { id: 2, contenido: 'Bien, gracias. ¿Hay tarea?', remitente: 'Yo', remitente_id: 3, created_at: '2026-04-27T09:02:00', propio: true },
  { id: 3, contenido: 'Sí, recuerda entregar la tarea del módulo 2.', remitente: 'Prof. García', remitente_id: 2, created_at: '2026-04-27T09:05:00', propio: false },
];

const conceptosPago = [
  { id: 1, nombre: 'Matrícula 2026-I', monto: 250.00, descripcion: 'Pago de matrícula semestral' },
  { id: 2, nombre: 'Pensión Mensual', monto: 180.00, descripcion: 'Cuota mensual de enseñanza' },
  { id: 3, nombre: 'Seguro Estudiantil', monto: 35.00, descripcion: 'Seguro médico estudiantil' },
];

const pagos = [
  { id: 1, concepto: 'Matrícula 2026-I', monto: 250.00, estado: 'pagado', fecha_vencimiento: '2026-03-01' },
  { id: 2, concepto: 'Pensión Abril', monto: 180.00, estado: 'pagado', fecha_vencimiento: '2026-04-05' },
  { id: 3, concepto: 'Pensión Mayo', monto: 180.00, estado: 'pendiente', fecha_vencimiento: '2026-05-05' },
  { id: 4, concepto: 'Seguro Estudiantil', monto: 35.00, estado: 'vencido', fecha_vencimiento: '2026-04-01' },
];

const tickets = [
  { id: 1, asunto: 'No puedo acceder al sistema', descripcion: 'Me sale error de credenciales inválidas aunque estoy seguro de mi contraseña.', categoria: 'tecnico', prioridad: 'alta', estado: 'en_proceso', created_at: '2026-04-25T08:00:00' },
  { id: 2, asunto: 'Error en mis notas registradas', descripcion: 'La nota de Cálculo aparece incorrecta en mi historial.', categoria: 'academico', prioridad: 'media', estado: 'abierto', created_at: '2026-04-26T10:00:00' },
  { id: 3, asunto: 'Solicitud de certificado', descripcion: 'Necesito un certificado de estudios para trámite bancario.', categoria: 'administrativo', prioridad: 'baja', estado: 'resuelto', created_at: '2026-04-20T14:00:00' },
];

const circulares = [
  { id: 1, titulo: 'Inicio de clases 2026-I', contenido: 'El inicio del ciclo académico 2026-I está programado para el 5 de mayo. Se requiere matrícula vigente para acceder a las aulas virtuales.', destinatario: 'todos', autor: 'Dirección Académica', created_at: '2026-04-28T10:00:00', leida: false },
  { id: 2, titulo: 'Capacitación docente — Plataforma Virtual', contenido: 'Se convoca a todos los docentes a la capacitación en uso de la plataforma virtual el día 3 de mayo a las 3:00 PM en el aula de cómputo principal.', destinatario: 'docentes', autor: 'Coordinación Pedagógica', created_at: '2026-04-25T08:00:00', leida: false },
  { id: 3, titulo: 'Recordatorio entrega de trabajos finales', contenido: 'Se recuerda a los estudiantes que la fecha límite para la entrega de trabajos del ciclo 2025-II es el 30 de abril. No se aceptarán entregas tardías.', destinatario: 'estudiantes', autor: 'Secretaría Académica', created_at: '2026-04-22T12:00:00', leida: true },
];

export const MOCK = {
  cursos,
  matriculas,
  notas,
  asistencias,
  dashboardStats,
  usuarios,
  clasesVirtuales,
  notificaciones,
  materiales,
  historialAcademico,
  reportesResumen,
  foros,
  hilos,
  conversaciones,
  mensajes,
  pagos,
  conceptosPago,
  tickets,
  circulares,
};
