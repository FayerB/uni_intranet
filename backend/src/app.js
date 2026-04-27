const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const usuariosRoutes = require('./modules/usuarios/usuarios.routes');
const noticiasRoutes = require('./modules/noticias/noticias.routes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/noticias', noticiasRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
