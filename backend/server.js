require('dotenv').config();
const http   = require('http');
const { Server } = require('socket.io');

const app    = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true },
  path: '/socket.io',
});

const { verifyToken } = require('./src/utils/jwt');

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('Token requerido'));
  try {
    socket.user = verifyToken(token);
    next();
  } catch {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  socket.join(`user_${userId}`);
  logger.debug(`[WS] conectado: ${userId}`);

  // Unirse a conversaciones
  socket.on('join_conv', (conversacion_id) => {
    socket.join(`conv_${conversacion_id}`);
  });

  socket.on('leave_conv', (conversacion_id) => {
    socket.leave(`conv_${conversacion_id}`);
  });

  socket.on('disconnect', () => {
    logger.debug(`[WS] desconectado: ${userId}`);
  });
});

// Inyectar io en el controlador de mensajería
const mensajeriaCtrl = require('./src/modules/mensajeria/mensajeria.controller');
mensajeriaCtrl.setIo(io);

// Exportar io para usarlo en otros módulos
app.set('io', io);

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  logger.info(`[server] http://localhost:${PORT} — WebSocket activo`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = () => {
  logger.info('[server] apagando...');
  server.close(() => {
    logger.info('[server] apagado.');
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);
