require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

// ── Usuarios ──────────────────────────────────────────────────────────────────
const usuariosData = [
  // Director / Admin
  { nombre: 'Carlos',    apellido: 'Mendoza Ríos',     email: 'director@ie20456.edu.pe',     password: 'Admin123',   rol: 'admin'      },
  // Docentes (docenteEmail referenciado en materias abajo)
  { nombre: 'Roberto',   apellido: 'Torres Salazar',    email: 'r.torres@ie20456.edu.pe',     password: 'Docente123', rol: 'docente'    },
  { nombre: 'Ana',       apellido: 'Vargas Huamán',     email: 'a.vargas@ie20456.edu.pe',     password: 'Docente123', rol: 'docente'    },
  { nombre: 'Miguel',    apellido: 'Quispe Ccama',      email: 'm.quispe@ie20456.edu.pe',     password: 'Docente123', rol: 'docente'    },
  { nombre: 'Carmen',    apellido: 'Flores Condori',    email: 'c.flores@ie20456.edu.pe',     password: 'Docente123', rol: 'docente'    },
  { nombre: 'Luis',      apellido: 'Mendoza Apaza',     email: 'l.mendoza@ie20456.edu.pe',    password: 'Docente123', rol: 'docente'    },
  { nombre: 'Jorge',     apellido: 'Mamani Choque',     email: 'j.mamani@ie20456.edu.pe',     password: 'Docente123', rol: 'docente'    },
  { nombre: 'Sandra',    apellido: 'Huanca Layme',      email: 's.huanca@ie20456.edu.pe',     password: 'Docente123', rol: 'docente'    },
  { nombre: 'Patricia',  apellido: 'Ccopa Quispe',      email: 'p.ccopa@ie20456.edu.pe',      password: 'Docente123', rol: 'docente'    },
  // Estudiantes — 1° A
  { nombre: 'Lucía',     apellido: 'Quispe Tapia',      email: 'lucia.qt@ie20456.edu.pe',     password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Diego',     apellido: 'Huanca Flores',     email: 'diego.hf@ie20456.edu.pe',     password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Valeria',   apellido: 'Mamani Cruz',       email: 'valeria.mc@ie20456.edu.pe',   password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Sebastián', apellido: 'Torres Yupanqui',   email: 'sebastian.ty@ie20456.edu.pe', password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Camila',    apellido: 'Condori Apaza',     email: 'camila.ca@ie20456.edu.pe',    password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Aarón',     apellido: 'Layme Quispe',      email: 'aaron.lq@ie20456.edu.pe',     password: 'Estudi123',  rol: 'estudiante' },
  // Estudiantes — 1° B
  { nombre: 'Fernanda',  apellido: 'Ccopa Torres',      email: 'fernanda.ct@ie20456.edu.pe',  password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Rodrigo',   apellido: 'Apaza Huanca',      email: 'rodrigo.ah@ie20456.edu.pe',   password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Isabella',  apellido: 'Salazar Mamani',    email: 'isabella.sm@ie20456.edu.pe',  password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Mateo',     apellido: 'Cruz Condori',      email: 'mateo.cc@ie20456.edu.pe',     password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Gabriela',  apellido: 'Yupanqui Layme',    email: 'gabriela.yl@ie20456.edu.pe',  password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'André',     apellido: 'Quispe Flores',     email: 'andre.qf@ie20456.edu.pe',     password: 'Estudi123',  rol: 'estudiante' },
  // Estudiantes — 2° A
  { nombre: 'Sofía',     apellido: 'Mamani Torres',     email: 'sofia.mt@ie20456.edu.pe',     password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Emilio',    apellido: 'Flores Quispe',     email: 'emilio.fq@ie20456.edu.pe',    password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Renata',    apellido: 'Condori Ccopa',     email: 'renata.cc@ie20456.edu.pe',    password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Franco',    apellido: 'Apaza Salazar',     email: 'franco.as@ie20456.edu.pe',    password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Alessia',   apellido: 'Torres Mamani',     email: 'alessia.tm@ie20456.edu.pe',   password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Javier',    apellido: 'Layme Cruz',        email: 'javier.lc@ie20456.edu.pe',    password: 'Estudi123',  rol: 'estudiante' },
  // Estudiantes — 2° B
  { nombre: 'Daniela',   apellido: 'Huanca Yupanqui',   email: 'daniela.hy@ie20456.edu.pe',  password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Nicolás',   apellido: 'Quispe Apaza',      email: 'nicolas.qa@ie20456.edu.pe',   password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Valentina', apellido: 'Ccopa Flores',      email: 'valentina.cf@ie20456.edu.pe', password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Arturo',    apellido: 'Mamani Condori',    email: 'arturo.mc2@ie20456.edu.pe',   password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Xiomara',   apellido: 'Torres Layme',      email: 'xiomara.tl@ie20456.edu.pe',   password: 'Estudi123',  rol: 'estudiante' },
  { nombre: 'Paulo',     apellido: 'Salazar Huanca',    email: 'paulo.sh@ie20456.edu.pe',     password: 'Estudi123',  rol: 'estudiante' },
];

// ── Currículo peruano secundaria ──────────────────────────────────────────────
// horas = horas pedagógicas semanales (usamos el campo creditos del schema)
const materias = [
  { nombre: 'Matemática',                               cod: 'MAT', docenteEmail: 'r.torres@ie20456.edu.pe', horas: 6 },
  { nombre: 'Comunicación',                             cod: 'COM', docenteEmail: 'a.vargas@ie20456.edu.pe', horas: 5 },
  { nombre: 'Historia, Geografía y Economía',           cod: 'HGE', docenteEmail: 'm.quispe@ie20456.edu.pe', horas: 3 },
  { nombre: 'Ciencia y Tecnología',                     cod: 'CTA', docenteEmail: 'c.flores@ie20456.edu.pe', horas: 4 },
  { nombre: 'Inglés',                                   cod: 'ING', docenteEmail: 'l.mendoza@ie20456.edu.pe',horas: 3 },
  { nombre: 'Educación Física',                         cod: 'EDF', docenteEmail: 'j.mamani@ie20456.edu.pe', horas: 2 },
  { nombre: 'Arte y Cultura',                           cod: 'ART', docenteEmail: 's.huanca@ie20456.edu.pe', horas: 2 },
  { nombre: 'Desarrollo Personal, Ciudadanía y Cívica', cod: 'DPC', docenteEmail: 'p.ccopa@ie20456.edu.pe',  horas: 2 },
];

// ── Aulas: grado, sección y sus estudiantes ───────────────────────────────────
const aulas = [
  {
    grado: '1°', seccion: 'A',
    emails: [
      'lucia.qt@ie20456.edu.pe', 'diego.hf@ie20456.edu.pe',    'valeria.mc@ie20456.edu.pe',
      'sebastian.ty@ie20456.edu.pe', 'camila.ca@ie20456.edu.pe', 'aaron.lq@ie20456.edu.pe',
    ],
  },
  {
    grado: '1°', seccion: 'B',
    emails: [
      'fernanda.ct@ie20456.edu.pe', 'rodrigo.ah@ie20456.edu.pe', 'isabella.sm@ie20456.edu.pe',
      'mateo.cc@ie20456.edu.pe',    'gabriela.yl@ie20456.edu.pe', 'andre.qf@ie20456.edu.pe',
    ],
  },
  {
    grado: '2°', seccion: 'A',
    emails: [
      'sofia.mt@ie20456.edu.pe',  'emilio.fq@ie20456.edu.pe',  'renata.cc@ie20456.edu.pe',
      'franco.as@ie20456.edu.pe', 'alessia.tm@ie20456.edu.pe', 'javier.lc@ie20456.edu.pe',
    ],
  },
  {
    grado: '2°', seccion: 'B',
    emails: [
      'daniela.hy@ie20456.edu.pe', 'nicolas.qa@ie20456.edu.pe',  'valentina.cf@ie20456.edu.pe',
      'arturo.mc2@ie20456.edu.pe', 'xiomara.tl@ie20456.edu.pe',  'paulo.sh@ie20456.edu.pe',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('[seed] iniciando datos para colegio peruano...\n');

  // 1. Usuarios
  console.log('[seed] insertando usuarios...');
  const uid = {}; // email → id
  for (const u of usuariosData) {
    const hash = await bcrypt.hash(u.password, 10);
    const res = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password, rol)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE
         SET nombre = EXCLUDED.nombre, apellido = EXCLUDED.apellido
       RETURNING id`,
      [u.nombre, u.apellido, u.email, hash, u.rol]
    );
    uid[u.email] = res.rows[0].id;
  }
  console.log(`  [ok] ${usuariosData.length} usuarios (1 admin, 8 docentes, ${usuariosData.length - 9} estudiantes)`);

  // 2. Período académico 2025
  let periodoId;
  const existing = await pool.query(
    `SELECT id FROM periodos_academicos WHERE nombre = '2025' LIMIT 1`
  );
  if (existing.rows.length > 0) {
    periodoId = existing.rows[0].id;
  } else {
    const p = await pool.query(
      `INSERT INTO periodos_academicos (nombre, fecha_inicio, fecha_fin, activo)
       VALUES ('2025','2025-03-03','2025-12-19',true) RETURNING id`
    );
    periodoId = p.rows[0].id;
  }
  console.log(`  [ok] período académico 2025`);

  // 3. Cursos y matrículas por aula
  console.log('[seed] insertando cursos y matrículas...');
  let totalCursos = 0;
  let totalMatriculas = 0;

  for (const aula of aulas) {
    const gradoNum = aula.grado.replace('°', '');

    for (const m of materias) {
      const codigo  = `${m.cod}-${gradoNum}${aula.seccion}-2025`;
      const nombre  = `${m.nombre} — ${aula.grado} "${aula.seccion}"`;
      const desc    = `Área ${m.nombre}, ${aula.grado} sección "${aula.seccion}", año 2025`;

      const cr = await pool.query(
        `INSERT INTO cursos (codigo, nombre, descripcion, creditos, tipo, docente_id, periodo_id, grado, seccion)
         VALUES ($1,$2,$3,$4,'Obligatorio',$5,$6,$7,$8)
         ON CONFLICT (codigo) DO UPDATE
           SET nombre     = EXCLUDED.nombre,
               docente_id = EXCLUDED.docente_id,
               grado      = EXCLUDED.grado,
               seccion    = EXCLUDED.seccion
         RETURNING id`,
        [codigo, nombre, desc, m.horas, uid[m.docenteEmail], periodoId, aula.grado, aula.seccion]
      );
      const cursoId = cr.rows[0].id;
      totalCursos++;

      for (const email of aula.emails) {
        await pool.query(
          `INSERT INTO matriculas (estudiante_id, curso_id, estado)
           VALUES ($1,$2,'activo')
           ON CONFLICT (estudiante_id, curso_id) DO NOTHING`,
          [uid[email], cursoId]
        );
        totalMatriculas++;
      }
    }

    console.log(`  [ok] ${aula.grado} "${aula.seccion}" — ${materias.length} cursos, ${aula.emails.length} estudiantes`);
  }

  // 4. Configuración institucional
  await pool.query(`
    UPDATE configuracion_sistema
    SET valor = 'I.E. N° 20456 "San Martín de Porres"'
    WHERE clave = 'nombre_institucion'
  `);
  await pool.query(`
    UPDATE configuracion_sistema SET valor = '11' WHERE clave = 'nota_aprobacion'
  `);
  console.log('  [ok] configuración institucional');

  // 5. Circulares de ejemplo
  const adminId = uid['director@ie20456.edu.pe'];
  const circulares = [
    {
      titulo: 'Bienvenidos al Año Escolar 2025',
      contenido: 'Estimada comunidad educativa: Les damos la bienvenida al año escolar 2025. Las clases inician el lunes 3 de marzo. Recordamos que el uso del uniforme escolar es obligatorio. Ante cualquier consulta, acérquense a la Dirección.',
      destinatario: 'todos',
    },
    {
      titulo: 'Cronograma de Evaluaciones — Primer Bimestre',
      contenido: 'Se comunica que las evaluaciones del primer bimestre se realizarán del 28 de abril al 9 de mayo. Los docentes deberán registrar las notas antes del 16 de mayo.',
      destinatario: 'todos',
    },
    {
      titulo: 'Reunión de Padres de Familia — Mayo 2025',
      contenido: 'Se convoca a los padres y madres de familia a la reunión informativa del primer bimestre el día sábado 17 de mayo a las 9:00 a.m. en el auditorio de la institución.',
      destinatario: 'estudiantes',
    },
    {
      titulo: 'Capacitación Docente — Plataforma Virtual',
      contenido: 'Se informa a los docentes que el viernes 23 de mayo se realizará una capacitación sobre el uso de la plataforma virtual educativa. La asistencia es obligatoria. Hora: 4:00 p.m. en el laboratorio de cómputo.',
      destinatario: 'docentes',
    },
  ];

  for (const c of circulares) {
    const exists = await pool.query(
      `SELECT id FROM circulares WHERE titulo = $1 LIMIT 1`, [c.titulo]
    );
    if (exists.rows.length === 0) {
      await pool.query(
        `INSERT INTO circulares (titulo, contenido, destinatario, autor_id)
         VALUES ($1,$2,$3,$4)`,
        [c.titulo, c.contenido, c.destinatario, adminId]
      );
    }
  }
  console.log('  [ok] circulares');

  // 6. Noticias de ejemplo
  const noticias = [
    {
      titulo: 'Inicio del Año Escolar 2025',
      resumen: 'La I.E. N° 20456 da inicio al año escolar con renovadas instalaciones y nuevo sistema de gestión académica.',
      contenido: 'Este año la institución cuenta con aulas renovadas, laboratorio de cómputo ampliado y el nuevo sistema de gestión académica en línea que permitirá a docentes, estudiantes y padres de familia hacer seguimiento en tiempo real del rendimiento escolar.',
      categoria: 'Institucional',
    },
    {
      titulo: 'Olimpiada Matemática Regional 2025',
      resumen: 'Tres estudiantes representarán a nuestra institución en la olimpiada regional de matemática.',
      contenido: 'Tras la fase interna realizada en marzo, los estudiantes Sebastián Torres Yupanqui (1°A), Sofía Mamani Torres (2°A) y Nicolás Quispe Apaza (2°B) clasificaron para representar a la I.E. N° 20456 en la olimpiada matemática regional a realizarse el próximo 15 de junio.',
      categoria: 'Academico',
    },
    {
      titulo: 'Feria de Ciencias — Convocatoria',
      resumen: 'Se convoca a los estudiantes a participar en la Feria de Ciencias Escolar 2025.',
      contenido: 'La Feria de Ciencias Escolar 2025 se realizará el 25 de octubre. Los equipos de dos a cuatro integrantes deberán inscribirse hasta el 30 de agosto ante el docente de Ciencia y Tecnología. Se premiarán los tres mejores proyectos de cada nivel.',
      categoria: 'Academico',
    },
  ];

  for (const n of noticias) {
    const exists = await pool.query(
      `SELECT id FROM noticias WHERE titulo = $1 LIMIT 1`, [n.titulo]
    );
    if (exists.rows.length === 0) {
      await pool.query(
        `INSERT INTO noticias (titulo, resumen, contenido, categoria, autor_id, publicado)
         VALUES ($1,$2,$3,$4,$5,true)`,
        [n.titulo, n.resumen, n.contenido, n.categoria, adminId]
      );
    }
  }
  console.log('  [ok] noticias');

  // ── Resumen ────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  console.log(' SEED COMPLETADO — I.E. N° 20456');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Usuarios   : ${usuariosData.length} (1 director, 8 docentes, ${usuariosData.length - 9} estudiantes)`);
  console.log(`  Aulas      : ${aulas.length} (1°A · 1°B · 2°A · 2°B)`);
  console.log(`  Cursos     : ${totalCursos}`);
  console.log(`  Matrículas : ${totalMatriculas}`);
  console.log('');
  console.log('  Credenciales de acceso:');
  console.log('  ┌─────────────┬──────────────────────────────────────┬────────────┐');
  console.log('  │ Rol         │ Email                                │ Contraseña │');
  console.log('  ├─────────────┼──────────────────────────────────────┼────────────┤');
  console.log('  │ Admin       │ director@ie20456.edu.pe              │ Admin123   │');
  console.log('  │ Docente     │ r.torres@ie20456.edu.pe              │ Docente123 │');
  console.log('  │ Estudiante  │ lucia.qt@ie20456.edu.pe              │ Estudi123  │');
  console.log('  └─────────────┴──────────────────────────────────────┴────────────┘');
  console.log('══════════════════════════════════════════════════\n');

  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] error:', err.message);
  process.exit(1);
});
