// Datos de demostración usados cuando el backend no está disponible.
// Cada clave corresponde a un endpoint del sistema.

const cursos = [
  { id: 1, code: 'MAT-1A-2025', name: 'Matemática — 1° "A"',                               grado: '1°', seccion: 'A', description: 'Álgebra, geometría y aritmética para primer grado.',           credits: 6, ciclo: '1°A', type: 'Obligatorio', students: 28, docente: 'Prof. Torres',  image: null },
  { id: 2, code: 'COM-1A-2025', name: 'Comunicación — 1° "A"',                              grado: '1°', seccion: 'A', description: 'Comprensión lectora, expresión oral y escrita.',              credits: 5, ciclo: '1°A', type: 'Obligatorio', students: 28, docente: 'Prof. Vargas',  image: null },
  { id: 3, code: 'HGE-1A-2025', name: 'Historia, Geografía y Economía — 1° "A"',            grado: '1°', seccion: 'A', description: 'Historia del Perú, geografía y fundamentos económicos.',     credits: 3, ciclo: '1°A', type: 'Obligatorio', students: 28, docente: 'Prof. Quispe',  image: null },
  { id: 4, code: 'CTA-1A-2025', name: 'Ciencia y Tecnología — 1° "A"',                      grado: '1°', seccion: 'A', description: 'Ciencias naturales, experimentos y tecnología aplicada.',    credits: 4, ciclo: '1°A', type: 'Obligatorio', students: 28, docente: 'Prof. Flores',  image: null },
  { id: 5, code: 'ING-1A-2025', name: 'Inglés — 1° "A"',                                    grado: '1°', seccion: 'A', description: 'Inglés básico, vocabulario y comprensión auditiva.',         credits: 3, ciclo: '1°A', type: 'Obligatorio', students: 28, docente: 'Prof. Mendoza', image: null },
  { id: 6, code: 'MAT-2A-2025', name: 'Matemática — 2° "A"',                               grado: '2°', seccion: 'A', description: 'Álgebra lineal, estadística y geometría analítica.',          credits: 6, ciclo: '2°A', type: 'Obligatorio', students: 25, docente: 'Prof. Torres',  image: null },
  { id: 7, code: 'COM-2A-2025', name: 'Comunicación — 2° "A"',                              grado: '2°', seccion: 'A', description: 'Texto argumentativo, literatura peruana y redacción.',       credits: 5, ciclo: '2°A', type: 'Obligatorio', students: 25, docente: 'Prof. Vargas',  image: null },
  { id: 8, code: 'HGE-2A-2025', name: 'Historia, Geografía y Economía — 2° "A"',            grado: '2°', seccion: 'A', description: 'Historia universal, geografía del Perú y economía básica.', credits: 3, ciclo: '2°A', type: 'Obligatorio', students: 25, docente: 'Prof. Quispe',  image: null },
];

const matriculas = [
  { id: 1, curso_id: 1, curso: 'Matemática — 1° "A"',                    codigo: 'MAT-1A-2025', creditos: 6, estado: 'activo', grado: '1°', seccion: 'A', estudiante: 'Demo Estudiante' },
  { id: 2, curso_id: 2, curso: 'Comunicación — 1° "A"',                   codigo: 'COM-1A-2025', creditos: 5, estado: 'activo', grado: '1°', seccion: 'A', estudiante: 'Demo Estudiante' },
  { id: 3, curso_id: 3, curso: 'Historia, Geografía y Economía — 1° "A"', codigo: 'HGE-1A-2025', creditos: 3, estado: 'activo', grado: '1°', seccion: 'A', estudiante: 'Demo Estudiante' },
  { id: 4, curso_id: 4, curso: 'Ciencia y Tecnología — 1° "A"',           codigo: 'CTA-1A-2025', creditos: 4, estado: 'activo', grado: '1°', seccion: 'A', estudiante: 'Demo Estudiante' },
  { id: 5, curso_id: 5, curso: 'Inglés — 1° "A"',                         codigo: 'ING-1A-2025', creditos: 3, estado: 'activo', grado: '1°', seccion: 'A', estudiante: 'Demo Estudiante' },
];

const notas = [
  { estudianteId: 1, name: 'Lucía Quispe Tapia',      p1: 16, p2: 15, ep: 17, ef: 18 },
  { estudianteId: 2, name: 'Diego Huanca Flores',     p1: 12, p2: 11, ep: 13, ef: 12 },
  { estudianteId: 3, name: 'Valeria Mamani Cruz',     p1: 19, p2: 18, ep: 20, ef: 19 },
  { estudianteId: 4, name: 'Sebastián Torres Yupanqui', p1: 8, p2: 9, ep: 8, ef: 10 },
  { estudianteId: 5, name: 'Camila Condori Apaza',    p1: 15, p2: 16, ep: 14, ef: 17 },
  { estudianteId: 6, name: 'Aarón Layme Quispe',      p1: 14, p2: 13, ep: 15, ef: 16 },
];

const asistencias = [
  { estudianteId: 1, name: 'Lucía Quispe Tapia',        estado: 'presente' },
  { estudianteId: 2, name: 'Diego Huanca Flores',       estado: 'falta'    },
  { estudianteId: 3, name: 'Valeria Mamani Cruz',       estado: 'presente' },
  { estudianteId: 4, name: 'Sebastián Torres Yupanqui', estado: 'tardanza' },
  { estudianteId: 5, name: 'Camila Condori Apaza',      estado: 'presente' },
  { estudianteId: 6, name: 'Aarón Layme Quispe',        estado: 'presente' },
];

const dashboardStats = {
  totalUsuarios: 33,
  usuariosPorRol: [
    { rol: 'admin',      cantidad: 1  },
    { rol: 'docente',    cantidad: 8  },
    { rol: 'estudiante', cantidad: 24 },
  ],
  noticiasPublicadas: 3,
  chartData: [
    { name: 'Mar', noticias: 2, usuarios: 5  },
    { name: 'Abr', noticias: 3, usuarios: 10 },
    { name: 'May', noticias: 4, usuarios: 8  },
    { name: 'Jun', noticias: 3, usuarios: 6  },
    { name: 'Jul', noticias: 5, usuarios: 9  },
    { name: 'Ago', noticias: 2, usuarios: 7  },
  ],
};

const usuarios = [
  { id: 1, name: 'Carlos Mendoza Ríos',     initial: 'C', email: 'director@ie20456.edu.pe',  role: 'admin',      status: 'Activo' },
  { id: 2, name: 'Roberto Torres Salazar',  initial: 'R', email: 'r.torres@ie20456.edu.pe',  role: 'docente',    status: 'Activo' },
  { id: 3, name: 'Ana Vargas Huamán',       initial: 'A', email: 'a.vargas@ie20456.edu.pe',  role: 'docente',    status: 'Activo' },
  { id: 4, name: 'Lucía Quispe Tapia',      initial: 'L', email: 'lucia.qt@ie20456.edu.pe',  role: 'estudiante', status: 'Activo' },
  { id: 5, name: 'Diego Huanca Flores',     initial: 'D', email: 'diego.hf@ie20456.edu.pe',  role: 'estudiante', status: 'Activo' },
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
  resumen: { totalCreditos: 27, promedioPonderado: 14.8, ciclosCompletados: 2, grado: '1°', seccion: 'A' },
  ciclos: [
    {
      ciclo: '1° Bimestre 2025',
      promedio: 15.5,
      creditosAprobados: 27,
      cursos: [
        { nombre: 'Matemática',                     codigo: 'MAT-1A-2025', creditos: 6, nota: 16, estado: 'Aprobado'    },
        { nombre: 'Comunicación',                   codigo: 'COM-1A-2025', creditos: 5, nota: 15, estado: 'Aprobado'    },
        { nombre: 'Historia, Geografía y Economía', codigo: 'HGE-1A-2025', creditos: 3, nota: 14, estado: 'Aprobado'    },
        { nombre: 'Ciencia y Tecnología',           codigo: 'CTA-1A-2025', creditos: 4, nota: 17, estado: 'Aprobado'    },
        { nombre: 'Inglés',                         codigo: 'ING-1A-2025', creditos: 3, nota: 13, estado: 'Aprobado'    },
        { nombre: 'Educación Física',               codigo: 'EDF-1A-2025', creditos: 2, nota: 18, estado: 'Aprobado'    },
        { nombre: 'Arte y Cultura',                 codigo: 'ART-1A-2025', creditos: 2, nota: 16, estado: 'Aprobado'    },
        { nombre: 'DPCC',                           codigo: 'DPC-1A-2025', creditos: 2, nota: 14, estado: 'Aprobado'    },
      ],
    },
    {
      ciclo: '2° Bimestre 2025',
      promedio: 14.1,
      creditosAprobados: 25,
      cursos: [
        { nombre: 'Matemática',                     codigo: 'MAT-1A-2025', creditos: 6, nota: 14, estado: 'Aprobado'    },
        { nombre: 'Comunicación',                   codigo: 'COM-1A-2025', creditos: 5, nota: 15, estado: 'Aprobado'    },
        { nombre: 'Historia, Geografía y Economía', codigo: 'HGE-1A-2025', creditos: 3, nota: 13, estado: 'Aprobado'    },
        { nombre: 'Ciencia y Tecnología',           codigo: 'CTA-1A-2025', creditos: 4, nota: 10, estado: 'Desaprobado' },
        { nombre: 'Inglés',                         codigo: 'ING-1A-2025', creditos: 3, nota: 16, estado: 'Aprobado'    },
        { nombre: 'Educación Física',               codigo: 'EDF-1A-2025', creditos: 2, nota: 17, estado: 'Aprobado'    },
        { nombre: 'Arte y Cultura',                 codigo: 'ART-1A-2025', creditos: 2, nota: 15, estado: 'Aprobado'    },
        { nombre: 'DPCC',                           codigo: 'DPC-1A-2025', creditos: 2, nota: 13, estado: 'Aprobado'    },
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
