const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const usuariosRoutes = require('./modules/usuarios/usuarios.routes');
const noticiasRoutes = require('./modules/noticias/noticias.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const reportesRoutes = require('./modules/reportes/reportes.routes');
const cursosRoutes = require('./modules/cursos/cursos.routes');
const matriculasRoutes = require('./modules/matriculas/matriculas.routes');
const notasRoutes = require('./modules/notas/notas.routes');
const asistenciasRoutes = require('./modules/asistencias/asistencias.routes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/matriculas', matriculasRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/asistencias', asistenciasRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
