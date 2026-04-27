require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const usuarios = [
  { nombre: 'Admin',   apellido: 'Sistema',  email: 'admin@universidad.edu',   password: 'Admin123',     rol: 'admin'      },
  { nombre: 'María',   apellido: 'González', email: 'maria@universidad.edu',    password: 'Docente123',   rol: 'docente'    },
  { nombre: 'Carlos',  apellido: 'Pérez',    email: 'carlos@universidad.edu',   password: 'Estudi123',    rol: 'estudiante' },
];

async function seed() {
  console.log('[seed] iniciando...');

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password, rol)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [u.nombre, u.apellido, u.email, hash, u.rol]
    );
    console.log(`  [ok] ${u.email}`);
  }

  console.log('[seed] completado');
  await pool.end();
}

seed().catch((err) => {
  console.error('[seed] error:', err.message);
  process.exit(1);
});
