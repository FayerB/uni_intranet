const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

// ─── Routes existentes ────────────────────────────────────────────────────────
const authRoutes        = require('./modules/auth/auth.routes');
const usuariosRoutes    = require('./modules/usuarios/usuarios.routes');
const noticiasRoutes    = require('./modules/noticias/noticias.routes');
const dashboardRoutes   = require('./modules/dashboard/dashboard.routes');
const reportesRoutes    = require('./modules/reportes/reportes.routes');
const cursosRoutes      = require('./modules/cursos/cursos.routes');
const matriculasRoutes  = require('./modules/matriculas/matriculas.routes');
const notasRoutes       = require('./modules/notas/notas.routes');
const asistenciasRoutes = require('./modules/asistencias/asistencias.routes');

// ─── Routes nuevos ────────────────────────────────────────────────────────────
const horariosRoutes        = require('./modules/horarios/horarios.routes');
const clasesRoutes          = require('./modules/clases-virtuales/clases.routes');
const tareasRoutes          = require('./modules/tareas/tareas.routes');
const examenesRoutes        = require('./modules/examenes/examenes.routes');
const forosRoutes           = require('./modules/foros/foros.routes');
const mensajeriaRoutes      = require('./modules/mensajeria/mensajeria.routes');
const notificacionesRoutes  = require('./modules/notificaciones/notificaciones.routes');
const recursosRoutes        = require('./modules/recursos/recursos.routes');
const calendarioRoutes      = require('./modules/calendario/calendario.routes');
const pagosRoutes           = require('./modules/pagos/pagos.routes');
const soporteRoutes         = require('./modules/soporte/soporte.routes');
const configuracionRoutes   = require('./modules/configuracion/configuracion.routes');
const archivosRoutes        = require('./modules/archivos/archivos.routes');
const circularesRoutes      = require('./modules/circulares/circulares.routes');

// ─── Middleware ───────────────────────────────────────────────────────────────
const errorHandler = require('./middlewares/errorHandler.middleware');
const limiter      = require('./middlewares/rateLimiter.middleware');

const app = express();

// ─── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // para servir archivos
}));

const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limiting general
app.use('/api/', limiter.general);
app.use('/api/auth/', limiter.auth);
app.use('/api/reportes/', limiter.reports);

// ─── Archivos estáticos ───────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── API Routes ───────────────────────────────────────────────────────────────

// Existentes
app.use('/api/auth',          authRoutes);
app.use('/api/usuarios',      usuariosRoutes);
app.use('/api/noticias',      noticiasRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/reportes',      reportesRoutes);
app.use('/api/cursos',        cursosRoutes);
app.use('/api/matriculas',    matriculasRoutes);
app.use('/api/notas',         notasRoutes);
app.use('/api/asistencias',   asistenciasRoutes);

// Nuevos
app.use('/api/horarios',        horariosRoutes);
app.use('/api/clases',          clasesRoutes);
app.use('/api/tareas',          tareasRoutes);
app.use('/api/examenes',        examenesRoutes);
app.use('/api/foros',           forosRoutes);
app.use('/api/mensajeria',      mensajeriaRoutes);
app.use('/api/notificaciones',  notificacionesRoutes);
app.use('/api/recursos',        recursosRoutes);
app.use('/api/calendario',      calendarioRoutes);
app.use('/api/pagos',           pagosRoutes);
app.use('/api/soporte',         soporteRoutes);
app.use('/api/configuracion',   configuracionRoutes);
app.use('/api/archivos',        archivosRoutes);
app.use('/api/circulares',      circularesRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));

// ─── Error handler global ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
