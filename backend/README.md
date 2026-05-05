# EduColegio — Backend API REST

> Servidor Node.js + Express que expone la API REST del sistema de campus virtual escolar. Maneja autenticación JWT, lógica de negocio, acceso a PostgreSQL y comunicación en tiempo real con Socket.IO.

---

## Tabla de contenidos

1. [Estructura del backend](#estructura-del-backend)
2. [Punto de entrada](#punto-de-entrada)
3. [Configuración de Express](#configuración-de-express)
4. [Conexión a la base de datos](#conexión-a-la-base-de-datos)
5. [Middlewares](#middlewares)
6. [Utilidades](#utilidades)
7. [Módulos](#módulos)
8. [WebSocket — Socket.IO](#websocket--socketio)
9. [Manejo de errores](#manejo-de-errores)
10. [Sistema de logs](#sistema-de-logs)
11. [Scripts disponibles](#scripts-disponibles)
12. [Variables de entorno](#variables-de-entorno)

---

## Estructura del backend

```
backend/
├── database/
│   ├── schema.sql        # Definición de todas las tablas (23 tablas)
│   ├── seed.js           # Inserta datos de prueba en la base de datos
│   └── migrate.js        # Aplica el schema a la base de datos
│
├── src/
│   ├── app.js            # Configuración central de Express y registro de rutas
│   ├── config/
│   │   └── db.js         # Pool de conexiones a PostgreSQL
│   ├── middlewares/
│   │   ├── auth.middleware.js         # Verifica el token JWT
│   │   ├── role.middleware.js         # Restringe acceso por rol
│   │   ├── validate.middleware.js     # Valida el body con Joi
│   │   ├── errorHandler.middleware.js # Captura y formatea todos los errores
│   │   └── rateLimiter.middleware.js  # Límite de peticiones por IP
│   ├── modules/          # 23 módulos, uno por dominio de negocio
│   └── utils/
│       ├── apiError.js   # Clase ApiError con métodos estáticos
│       ├── jwt.js        # Genera y verifica tokens JWT
│       ├── logger.js     # Logger centralizado con Winston
│       └── pagination.js # Utilidad para paginación de resultados
│
├── logs/
│   ├── combined.log      # Todos los logs de la aplicación
│   ├── error.log         # Solo errores
│   └── exceptions.log    # Excepciones no capturadas
│
├── server.js             # Punto de entrada: HTTP + Socket.IO
└── package.json
```

Cada módulo tiene exactamente 3 archivos:

```
modulo/
├── modulo.routes.js      # Define las rutas y aplica middlewares
├── modulo.controller.js  # Recibe req/res, llama al service, devuelve respuesta
└── modulo.service.js     # Lógica de negocio y consultas SQL con pg Pool
```

---

## Punto de entrada

**Archivo:** `server.js`

Responsabilidades:
- Carga las variables de entorno con `dotenv`
- Crea el servidor HTTP sobre la app Express
- Inicializa Socket.IO con autenticación JWT en el handshake
- Inyecta la instancia de `io` en el controlador de mensajería
- Escucha en el puerto definido por `PORT` (por defecto 3001)
- Maneja el apagado limpio del servidor con `SIGTERM` y `SIGINT`

```
Cliente WebSocket
      |
      | handshake con token JWT
      ↓
Socket.IO (server.js)
      |
      | verifica token → socket.user = { id, email, role }
      ↓
Eventos: join_conv / leave_conv / disconnect
```

---

## Configuración de Express

**Archivo:** `src/app.js`

Middleware global aplicado en orden:

| Orden | Middleware | Propósito |
|---|---|---|
| 1 | `helmet()` | Agrega cabeceras de seguridad HTTP |
| 2 | `cors()` | Permite peticiones solo desde `CORS_ORIGIN` |
| 3 | `express.json({ limit: '2mb' })` | Parsea cuerpos JSON |
| 4 | `express.urlencoded(...)` | Parsea formularios |
| 5 | `limiter.general` | Máximo 200 req / 15 min por IP |
| 6 | `limiter.auth` | Máximo 10 req / 15 min en `/api/auth/` |
| 7 | `limiter.reports` | Máximo 10 req / hora en `/api/reportes/` |
| 8 | `express.static(UPLOAD_DIR)` | Sirve archivos subidos en `/uploads` |
| Final | `errorHandler` | Captura todos los errores no manejados |

**Ruta de health check:**
```
GET /health → { "status": "ok", "ts": "2026-05-04T..." }
```

---

## Conexión a la base de datos

**Archivo:** `src/config/db.js`

Usa `pg.Pool` para manejar múltiples conexiones simultáneas.

Soporta dos modos de conexión:

```js
// Modo 1 — usando DATABASE_URL (Render, Neon, Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

// Modo 2 — usando variables individuales (desarrollo local)
DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
```

El pool se exporta como módulo y cada service lo importa directamente:
```js
const pool = require('../../config/db');
const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
```

> Siempre se usan **parámetros posicionales** (`$1`, `$2`...) para prevenir inyección SQL.

---

## Middlewares

### `auth.middleware.js`

Verifica que el request tenga un token JWT válido en el encabezado `Authorization`.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si el token es válido, agrega `req.user` con el payload:
```js
req.user = { id: "uuid", email: "...", role: "admin" }
```

Si falta o es inválido → `401 No autorizado`

---

### `role.middleware.js`

Restringe el acceso a rutas según el rol del usuario.

```js
// Uso en routes:
router.post('/', role('admin', 'docente'), ctrl.create);
router.delete('/:id', role('admin'), ctrl.remove);
```

Si el rol no está permitido → `403 Acceso denegado`

---

### `validate.middleware.js`

Valida el cuerpo (`req.body`) del request contra un schema Joi antes de llegar al controlador.

```js
// Uso en routes:
router.post('/login', validate(schemas.login), ctrl.login);
```

Si la validación falla → `400 Datos inválidos` con lista de errores específicos.

**Schemas disponibles:**

| Schema | Usado en |
|---|---|
| `login` | `POST /auth/login` |
| `usuario` | `POST /usuarios` |
| `curso` | `POST /cursos` |
| `tarea` | `POST /tareas` |
| `entrega` | `POST /tareas/:id/entregar` |
| `calificarEntrega` | `PUT /tareas/:id/entregas/:id/calificar` |
| `examen` | `POST /examenes` |
| `pregunta` | `POST /examenes/:id/preguntas` |
| `mensaje` | `POST /mensajeria/:id/mensajes` |
| `iniciarDirecta` | `POST /mensajeria/iniciar` |
| `recurso` | `POST /recursos` |
| `evento` | `POST /calendario` |
| `ticket` | `POST /soporte` |
| `horario` | `POST /horarios` |
| `claseVirtual` | `POST /clases` |

---

### `errorHandler.middleware.js`

Captura **todos** los errores lanzados con `next(error)` en los controladores.

| Tipo de error | Código | Respuesta |
|---|---|---|
| `ApiError` (lanzado manualmente) | El del error | `{ message: "..." }` |
| PG `42P01` — tabla no existe | GET → 200 `[]`, otros → 503 | Módulo en configuración |
| PG `22P02` — UUID inválido | 400 | ID con formato inválido |
| PG `23505` — duplicado | 409 | El registro ya existe |
| PG `23503` — clave foránea | 400 | Referencia inválida |
| PG `23514` — check constraint | 400 | Valor fuera del rango |
| Multer `LIMIT_FILE_SIZE` | 413 | Archivo demasiado grande |
| Cualquier otro | 500 | Error interno del servidor |

---

### `rateLimiter.middleware.js`

Tres niveles de límite por IP:

| Limitador | Máximo | Ventana | Aplicado en |
|---|---|---|---|
| `general` | 200 req | 15 min | Todas las rutas `/api/` |
| `auth` | 10 req | 15 min | `/api/auth/` |
| `reports` | 10 req | 1 hora | `/api/reportes/` |

---

## Utilidades

### `utils/apiError.js`

Clase para lanzar errores HTTP controlados desde cualquier capa.

```js
const { ApiError } = require('../../utils/apiError');

// Métodos disponibles:
throw ApiError.badRequest('Datos inválidos');       // 400
throw ApiError.unauthorized('No autenticado');      // 401
throw ApiError.forbidden('Acceso denegado');        // 403
throw ApiError.notFound('Recurso no encontrado');   // 404
throw ApiError.conflict('Ya existe');               // 409
throw ApiError.internal('Error del servidor');      // 500
```

---

### `utils/jwt.js`

Genera y verifica tokens JWT firmados con HS256.

```js
const { generateToken, verifyToken } = require('../../utils/jwt');

// Generar token (payload: { id, email, role })
const token = generateToken({ id, email, role });

// Verificar token
const payload = verifyToken(token); // lanza error si inválido o expirado
```

> El servidor **no arranca** si `JWT_SECRET` no está definido o tiene menos de 32 caracteres.

---

### `utils/logger.js`

Logger centralizado con Winston. Escribe en consola y en archivos.

```js
const logger = require('../../utils/logger');

logger.info('Servidor iniciado en puerto 3000');
logger.warn('Intento de acceso no autorizado');
logger.error('Error al conectar con la base de datos', err);
logger.debug('[WS] usuario conectado: uuid');
```

Niveles en producción: `warn` y `error` solamente.
Niveles en desarrollo: todos incluido `debug`.

Archivos de log:
- `logs/combined.log` — todos los niveles (máx. 10 MB × 5 archivos)
- `logs/error.log` — solo errores (máx. 5 MB × 5 archivos)
- `logs/exceptions.log` — excepciones no capturadas

---

## Módulos

Cada módulo sigue el patrón: **Routes → Controller → Service → DB**

```
Request HTTP
    ↓
routes.js       → aplica auth, role, validate
    ↓
controller.js   → extrae params/body, llama al service, responde
    ↓
service.js      → ejecuta lógica y consultas SQL
    ↓
PostgreSQL
```

### Lista de módulos

| Módulo | Directorio | Descripción |
|---|---|---|
| Autenticación | `auth/` | Login y perfil |
| Usuarios | `usuarios/` | CRUD de usuarios y cambio de contraseña |
| Cursos | `cursos/` | Gestión de materias |
| Matrículas | `matriculas/` | Inscripción de estudiantes a cursos |
| Notas | `notas/` | Calificaciones bimestrales (B1–B4) |
| Asistencias | `asistencias/` | Registro de asistencia diaria |
| Horarios | `horarios/` | Horario semanal por curso |
| Noticias | `noticias/` | Publicaciones institucionales |
| Circulares | `circulares/` | Comunicados dirigidos por rol |
| Mensajería | `mensajeria/` | Chat privado con Socket.IO |
| Tareas | `tareas/` | Publicación, entrega y calificación |
| Exámenes | `examenes/` | Exámenes con preguntas e intentos |
| Foros | `foros/` | Hilos de discusión por curso |
| Recursos | `recursos/` | Material de estudio descargable |
| Calendario | `calendario/` | Eventos académicos |
| Clases Virtuales | `clases-virtuales/` | Sesiones en línea programadas |
| Notificaciones | `notificaciones/` | Alertas del sistema |
| Pagos | `pagos/` | Conceptos y registro de pagos |
| Soporte | `soporte/` | Tickets de ayuda técnica |
| Reportes | `reportes/` | Resúmenes + exportación Excel/PDF |
| Dashboard | `dashboard/` | Estadísticas personalizadas por rol |
| Configuración | `configuracion/` | Ajustes del sistema y períodos |
| Archivos | `archivos/` | Subida de archivos con Multer |

---

## WebSocket — Socket.IO

**Archivo:** `server.js`

El servidor WebSocket corre en el mismo puerto que HTTP.

### Autenticación de la conexión

El cliente debe enviar el JWT al conectarse:
```js
const socket = io('https://campus-virtual-077o.onrender.com', {
  auth: { token: localStorage.getItem('token') }
});
```

Si el token es inválido → la conexión se rechaza con error `"Token inválido"`.

### Eventos disponibles

| Evento | Dirección | Descripción |
|---|---|---|
| `join_conv` | Cliente → Servidor | Unirse a una sala de conversación |
| `leave_conv` | Cliente → Servidor | Salir de una sala de conversación |
| `disconnect` | Cliente → Servidor | Desconexión del socket |
| `nuevo_mensaje` | Servidor → Cliente | Nuevo mensaje en la conversación activa |

### Salas (rooms)

```
user_{userId}     → sala personal de cada usuario
conv_{convId}     → sala compartida de una conversación
```

---

## Manejo de errores

### Patrón correcto en controladores

Todos los controladores usan `next(e)` para delegar el error al `errorHandler`:

```js
const miController = async (req, res, next) => {
  try {
    const data = await miService.obtenerDatos(req.params.id);
    res.json(data);
  } catch (e) {
    next(e); // ← siempre así, nunca res.status(500).json(...)
  }
};
```

### Lanzar errores desde el service

```js
const { ApiError } = require('../../utils/apiError');

const obtenerDatos = async (id) => {
  const { rows } = await pool.query('SELECT * FROM tabla WHERE id = $1', [id]);
  if (!rows[0]) throw ApiError.notFound('Registro no encontrado');
  return rows[0];
};
```

### Formato de respuesta de error

```json
{
  "message": "Descripción del error"
}
```

En errores de validación Joi:
```json
{
  "message": "Datos inválidos",
  "errors": [
    "\"email\" must be a valid email",
    "\"password\" length must be at least 6 characters long"
  ]
}
```

---

## Sistema de logs

Los logs se escriben automáticamente en la carpeta `logs/`:

```
logs/
├── combined.log      ← todo (info, warn, error, debug)
├── error.log         ← solo errores
└── exceptions.log    ← crashes no capturados
```

Formato de cada línea:
```
2026-05-04 10:23:45 [info]: [server] http://localhost:3000 — WebSocket activo
2026-05-04 10:24:01 [warn]: [db] error inesperado: connection refused
2026-05-04 10:24:15 [error]: Cannot read properties of undefined
```

---

## Scripts disponibles

```bash
# Iniciar en producción
npm start

# Iniciar en desarrollo (recarga automática con nodemon)
npm run dev

# Aplicar schema a la base de datos
npm run migrate

# Insertar datos de prueba
npm run seed
```

---

## Variables de entorno

Crear el archivo `backend/.env`:

```env
# Entorno
NODE_ENV=development
PORT=3000

# Base de datos — opción 1: URL completa (producción)
DATABASE_URL=postgresql://usuario:contraseña@host:5432/educolegio?sslmode=require

# Base de datos — opción 2: variables individuales (desarrollo local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=educolegio
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# JWT — mínimo 32 caracteres, el servidor no arranca sin esto
JWT_SECRET=clave_secreta_larga_minimo_32_caracteres
JWT_EXPIRES_IN=8h

# CORS — orígenes del frontend separados por coma
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Logs
LOG_LEVEL=debug
```

> En producción usar `DATABASE_URL` en vez de las variables individuales.
> Nunca subir `.env` al repositorio — está incluido en `.gitignore`.
