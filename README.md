# EduColegio — Sistema de Campus Virtual Escolar

> Plataforma web integral para la gestión académica de instituciones educativas. Conecta a administradores, docentes y estudiantes en un solo entorno digital.

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Tecnologías utilizadas](#tecnologías-utilizadas)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Instalación local](#instalación-local)
5. [Variables de entorno](#variables-de-entorno)
6. [Base de datos](#base-de-datos)
7. [Módulos del sistema](#módulos-del-sistema)
8. [API REST — Endpoints](#api-rest--endpoints)
9. [Roles y permisos](#roles-y-permisos)
10. [Despliegue en producción](#despliegue-en-producción)
11. [Equipo de desarrollo](#equipo-de-desarrollo)

---

## Descripción general

**EduColegio** es un sistema web tipo campus virtual diseñado para colegios. Permite gestionar de forma centralizada los procesos académicos y administrativos: registro de notas bimestrales, control de asistencia, comunicados institucionales, mensajería interna, tareas, horarios, pagos y más.

### Características principales

- Autenticación segura con JWT (token de 8 horas)
- Tres roles diferenciados: **Admin**, **Docente**, **Estudiante**
- Dashboard personalizado según el rol del usuario
- Diseño responsive (funciona en celular y escritorio)
- Modo oscuro / modo claro
- Datos de demostración cuando el backend no está disponible
- Exportación de reportes en Excel y PDF

---

## Tecnologías utilizadas

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Librería de interfaz de usuario |
| Vite | 6 | Empaquetador y servidor de desarrollo |
| Tailwind CSS | 3 | Estilos utilitarios |
| Framer Motion | 12 | Animaciones de interfaz |
| React Router DOM | 7 | Enrutamiento del lado del cliente |
| Zustand | 5 | Estado global de la aplicación |
| Axios | 1 | Cliente HTTP para llamadas a la API |
| Recharts | 3 | Gráficos estadísticos |
| Lucide React | 1 | Íconos vectoriales |
| SweetAlert2 | 11 | Modales de alerta y confirmación |
| Socket.IO Client | 4 | Comunicación en tiempo real |

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | ≥ 20 | Entorno de ejecución |
| Express | 4 | Framework de servidor HTTP |
| PostgreSQL | — | Base de datos relacional |
| node-postgres (pg) | 8 | Cliente de PostgreSQL para Node.js |
| JSON Web Token | 9 | Autenticación y autorización |
| bcrypt | 5 | Cifrado de contraseñas |
| Joi | 17 | Validación de datos de entrada |
| Helmet | 8 | Cabeceras de seguridad HTTP |
| CORS | 2 | Control de acceso entre dominios |
| express-rate-limit | 7 | Límite de peticiones por IP |
| Socket.IO | 4 | WebSocket para mensajería en tiempo real |
| ExcelJS | 4 | Generación de archivos Excel |
| PDFKit | 0.15 | Generación de archivos PDF |
| Winston | 3 | Sistema de logs |
| Multer | 1 | Subida de archivos |
| Nodemon | 3 | Reinicio automático en desarrollo |

---

## Estructura del proyecto

```
sis_intranet/
├── backend/
│   ├── database/
│   │   ├── schema.sql          # Esquema completo de la base de datos
│   │   ├── seed.js             # Datos de prueba iniciales
│   │   └── migrate.js          # Script de migración
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Conexión a PostgreSQL con Pool
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js        # Verificación de JWT
│   │   │   ├── role.middleware.js        # Control de roles
│   │   │   ├── validate.middleware.js    # Validación con Joi
│   │   │   ├── errorHandler.middleware.js # Manejo global de errores
│   │   │   └── rateLimiter.middleware.js  # Límite de peticiones
│   │   ├── modules/            # Un directorio por módulo
│   │   │   ├── auth/
│   │   │   ├── usuarios/
│   │   │   ├── cursos/
│   │   │   ├── matriculas/
│   │   │   ├── notas/
│   │   │   ├── asistencias/
│   │   │   ├── horarios/
│   │   │   ├── noticias/
│   │   │   ├── circulares/
│   │   │   ├── mensajeria/
│   │   │   ├── tareas/
│   │   │   ├── examenes/
│   │   │   ├── foros/
│   │   │   ├── recursos/
│   │   │   ├── calendario/
│   │   │   ├── clases-virtuales/
│   │   │   ├── notificaciones/
│   │   │   ├── pagos/
│   │   │   ├── soporte/
│   │   │   ├── reportes/
│   │   │   ├── dashboard/
│   │   │   ├── configuracion/
│   │   │   └── archivos/
│   │   ├── utils/
│   │   │   ├── apiError.js     # Clase de errores HTTP estandarizados
│   │   │   ├── jwt.js          # Generación y verificación de tokens
│   │   │   ├── logger.js       # Logger con Winston
│   │   │   └── pagination.js   # Utilidad de paginación
│   │   └── app.js              # Configuración de Express y rutas
│   ├── server.js               # Punto de entrada del servidor
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── logo.png            # Logo de la institución (favicon)
│   ├── src/
│   │   ├── api/
│   │   │   ├── index.js        # Instancia de Axios con interceptores
│   │   │   ├── fetchSafe.js    # Wrapper con fallback a datos mock
│   │   │   ├── mock.js         # Datos de demostración offline
│   │   │   ├── mensajeria.js   # API de mensajería
│   │   │   └── circulares.js   # API de circulares
│   │   ├── assets/
│   │   │   └── logo.png        # Logo para el sidebar
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── RoleGuard.jsx       # Protección de rutas por rol
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx         # Navegación lateral
│   │   │   │   └── Header.jsx          # Barra superior
│   │   │   ├── tables/
│   │   │   │   └── Table.jsx           # Componente de tabla reutilizable
│   │   │   └── ui/
│   │   │       ├── Button.jsx          # Botón reutilizable
│   │   │       ├── Card.jsx            # Tarjeta reutilizable
│   │   │       ├── Statistic.jsx       # Tarjeta de estadística
│   │   │       ├── ActivityFeed.jsx    # Feed de actividad reciente
│   │   │       └── SettingsModal.jsx   # Modal de configuración
│   │   ├── context/
│   │   │   └── useStore.js     # Estado global con Zustand
│   │   ├── hooks/
│   │   │   └── useRole.js      # Hook para obtener rol del usuario
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx          # Layout de pantallas de login
│   │   │   └── DashboardLayout.jsx     # Layout principal con sidebar
│   │   ├── pages/              # Una carpeta por módulo
│   │   │   ├── auth/           # Login
│   │   │   ├── dashboard/      # Estadísticas por rol
│   │   │   ├── perfil/         # Perfil y cambio de contraseña
│   │   │   ├── usuarios/       # CRUD de usuarios (admin)
│   │   │   ├── cursos/         # Gestión de cursos
│   │   │   ├── matriculas/     # Matrículas de estudiantes
│   │   │   ├── notas/          # Notas bimestrales
│   │   │   ├── asistencia/     # Control de asistencia diaria
│   │   │   ├── horarios/       # Horario semanal
│   │   │   ├── noticias/       # Noticias institucionales
│   │   │   ├── circulares/     # Comunicados por rol
│   │   │   ├── mensajeria/     # Chat interno
│   │   │   ├── tareas/         # Tareas con fecha de entrega
│   │   │   ├── clases/         # Clases virtuales
│   │   │   ├── foros/          # Foros de discusión
│   │   │   ├── recursos/       # Material de estudio
│   │   │   ├── calendario/     # Calendario de eventos
│   │   │   ├── pagos/          # Gestión de pagos
│   │   │   ├── soporte/        # Tickets de soporte
│   │   │   ├── reportes/       # Reportes con gráficos
│   │   │   ├── historial/      # Historial académico
│   │   │   └── material/       # Material por curso
│   │   ├── routes/
│   │   │   └── index.jsx       # Definición de rutas del cliente
│   │   └── main.jsx            # Punto de entrada de React
│   ├── index.html
│   └── package.json
│
├── vercel.json                 # Configuración de despliegue en Vercel
└── README.md                   # Este archivo
```

Cada módulo del backend sigue la estructura:
```
modulo/
├── modulo.routes.js      # Definición de rutas Express
├── modulo.controller.js  # Funciones que manejan req/res
└── modulo.service.js     # Lógica de negocio y consultas SQL
```

---

## Instalación local

### Requisitos previos

- Node.js 20 o superior
- PostgreSQL 14 o superior
- npm 10 o superior

### 1. Clonar el repositorio

```bash
git clone https://github.com/FayerB/uni_intranet.git
cd uni_intranet
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno

Crear el archivo `backend/.env` con el contenido indicado en la sección [Variables de entorno](#variables-de-entorno).

### 5. Crear la base de datos

```bash
# Conectarse a PostgreSQL y crear la base de datos
psql -U postgres
CREATE DATABASE educolegio;
\q

# Aplicar el esquema
psql -U postgres -d educolegio -f backend/database/schema.sql

# (Opcional) Cargar datos de prueba
cd backend
npm run seed
```

### 6. Iniciar el proyecto

En dos terminales separadas:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Servidor en http://localhost:3000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Aplicación en http://localhost:5173
```

---

## Variables de entorno

Crear el archivo `backend/.env`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=educolegio
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# Autenticación JWT
JWT_SECRET=clave_secreta_minimo_32_caracteres_aqui
JWT_EXPIRES_IN=8h

# CORS — orígenes permitidos (separados por coma)
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Subida de archivos (opcional)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

Crear el archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

> **Importante:** Nunca subas los archivos `.env` al repositorio. Ya están incluidos en `.gitignore`.

---

## Base de datos

### Tablas principales (23 tablas)

| # | Tabla | Descripción |
|---|---|---|
| 1 | `usuarios` | Datos de todos los usuarios del sistema |
| 2 | `relaciones_padre_hijo` | Vínculo entre padre y estudiante |
| 3 | `periodos_academicos` | Bimestres o años académicos |
| 4 | `noticias` | Publicaciones institucionales |
| 5 | `cursos` | Materias del colegio |
| 6 | `matriculas` | Inscripción de estudiantes a cursos |
| 7 | `notas` | Calificaciones bimestrales (B1–B4) |
| 8 | `asistencias` | Registro diario por curso y estudiante |
| 9 | `horarios` | Horario de clases por día y hora |
| 10 | `clases_virtuales` | Sesiones en línea con enlace de reunión |
| 11 | `tareas` | Actividades con fecha de entrega |
| 12 | `entregas_tareas` | Entrega de un estudiante a una tarea |
| 13 | `foros` | Espacios de discusión por curso |
| 14 | `hilos_foro` | Temas dentro de un foro |
| 15 | `respuestas_foro` | Respuestas a hilos |
| 16 | `mensajes_directos` | Conversaciones privadas entre usuarios |
| 17 | `mensajes` | Mensajes dentro de una conversación |
| 18 | `pagos` | Registro de pagos de estudiantes |
| 19 | `recursos` | Material de estudio por curso |
| 20 | `tickets_soporte` | Solicitudes de ayuda técnica o académica |
| 21 | `circulares` | Comunicados oficiales dirigidos por rol |
| 22 | `circulares_leidas` | Registro de lectura por usuario |
| 23 | `alertas` | Alertas automáticas de bajo rendimiento |

### Tipos de datos importantes

- Todos los IDs son `UUID` generados con `gen_random_uuid()`
- Las contraseñas se almacenan cifradas con `bcrypt` (10 rounds)
- Las notas van de `0` a `20` (escala vigesimal peruana)
- El promedio se calcula como `(B1 + B2 + B3 + B4) / 4`
- Un estudiante aprueba con promedio **≥ 11**

---

## Módulos del sistema

| Módulo | Descripción | Roles con acceso |
|---|---|---|
| **Dashboard** | Estadísticas personalizadas según rol | Todos |
| **Usuarios** | Crear, editar y desactivar cuentas | Admin |
| **Cursos** | Gestión de materias y asignación de docentes | Admin, Docente |
| **Matrículas** | Inscripción de estudiantes a cursos | Admin, Estudiante |
| **Notas** | Registro de calificaciones bimestrales | Admin, Docente (edita) / Estudiante (lee) |
| **Asistencia** | Control de asistencia diaria | Admin, Docente (registra) / Estudiante (consulta) |
| **Horarios** | Horario semanal de clases | Todos |
| **Noticias** | Publicaciones de la institución | Todos (Admin/Docente publican) |
| **Circulares** | Comunicados oficiales por rol | Todos (Admin/Docente crean) |
| **Mensajería** | Chat privado entre usuarios | Todos |
| **Tareas** | Publicación y entrega de tareas | Admin, Docente (crea) / Estudiante (entrega) |
| **Clases Virtuales** | Sesiones en línea programadas | Todos |
| **Foros** | Discusión académica por curso | Todos |
| **Recursos** | Material de estudio descargable | Todos |
| **Calendario** | Eventos académicos y personales | Todos |
| **Pagos** | Gestión de cobros y pensiones | Admin |
| **Soporte** | Tickets de ayuda técnica | Todos |
| **Reportes** | Estadísticas y exportación Excel/PDF | Admin |
| **Historial** | Récord académico del estudiante | Admin, Estudiante |
| **Perfil** | Datos personales y cambio de contraseña | Todos |
| **Configuración** | Preferencias del sistema | Admin (global) / Todos (notificaciones) |

---

## API REST — Endpoints

**URL base en producción:** `https://campus-virtual-077o.onrender.com/api`

**URL base en desarrollo:** `http://localhost:3000/api`

Todos los endpoints (excepto `/auth/login`) requieren el encabezado:
```
Authorization: Bearer <token>
```

### Autenticación

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión | No |
| `GET` | `/auth/perfil` | Ver perfil propio | Sí |
| `PATCH` | `/usuarios/perfil/password` | Cambiar contraseña | Sí |

**Cuerpo del login:**
```json
{
  "email": "admin@colegio.edu",
  "password": "123456"
}
```

**Respuesta del login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Nombre Apellido",
    "email": "correo@colegio.edu",
    "role": "admin"
  }
}
```

### Usuarios

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/usuarios` | Listar todos los usuarios | Admin |
| `GET` | `/usuarios/:id` | Ver un usuario | Admin |
| `POST` | `/usuarios` | Crear usuario | Admin |
| `PUT` | `/usuarios/:id` | Editar usuario | Admin |
| `DELETE` | `/usuarios/:id` | Desactivar usuario | Admin |

### Cursos

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/cursos` | Listar cursos | Todos |
| `GET` | `/cursos/:id` | Ver un curso | Todos |
| `POST` | `/cursos` | Crear curso | Admin, Docente |
| `PUT` | `/cursos/:id` | Editar curso | Admin, Docente |
| `DELETE` | `/cursos/:id` | Eliminar curso | Admin |

### Matrículas

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/matriculas` | Listar matrículas | Todos |
| `POST` | `/matriculas` | Matricular estudiante | Admin |
| `DELETE` | `/matriculas/:id` | Anular matrícula | Admin |

### Notas

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/notas?curso_id=` | Notas de un curso | Todos |
| `GET` | `/notas/historial` | Mi historial académico | Estudiante |
| `GET` | `/notas/historial/:id` | Historial de un estudiante | Admin, Docente |
| `POST` | `/notas` | Guardar notas bimestrales | Admin, Docente |

**Cuerpo para guardar notas:**
```json
{
  "curso_id": "uuid-del-curso",
  "grades": [
    {
      "estudianteId": "uuid-del-estudiante",
      "p1": 15,
      "p2": 14,
      "ep": 16,
      "ef": 17
    }
  ]
}
```

### Asistencias

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/asistencias?curso_id=&fecha=` | Ver asistencia de un día | Todos |
| `POST` | `/asistencias` | Registrar asistencia | Admin, Docente |

### Circulares

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/circulares` | Ver circulares del usuario | Todos |
| `POST` | `/circulares` | Publicar circular | Admin, Docente |
| `PATCH` | `/circulares/:id/leer` | Marcar como leída | Todos |
| `DELETE` | `/circulares/:id` | Eliminar circular | Admin, Docente |

**Cuerpo para crear circular:**
```json
{
  "titulo": "Inicio de clases",
  "contenido": "El ciclo 2026-I inicia el lunes 5 de mayo.",
  "destinatario": "todos"
}
```

> `destinatario` acepta: `"todos"`, `"docentes"`, `"estudiantes"`

### Mensajería

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/mensajeria` | Listar mis conversaciones |
| `POST` | `/mensajeria/iniciar` | Iniciar conversación con un usuario |
| `GET` | `/mensajeria/:id/mensajes` | Ver mensajes de una conversación |
| `POST` | `/mensajeria/:id/mensajes` | Enviar mensaje |

### Tareas

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/tareas/mias` | Mis tareas pendientes | Estudiante |
| `GET` | `/tareas/curso/:cursoId` | Tareas de un curso | Todos |
| `POST` | `/tareas` | Crear tarea | Admin, Docente |
| `PUT` | `/tareas/:id` | Editar tarea | Admin, Docente |
| `DELETE` | `/tareas/:id` | Eliminar tarea | Admin, Docente |
| `POST` | `/tareas/:id/entregar` | Entregar tarea | Estudiante |
| `PUT` | `/tareas/:id/entregas/:entregaId/calificar` | Calificar entrega | Admin, Docente |

### Dashboard

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/dashboard/stats` | Estadísticas según rol del usuario |

**Respuesta para admin:**
```json
{
  "role": "admin",
  "totalUsuarios": 128,
  "totalNoticias": 14,
  "noticiasPublicadas": 12,
  "totalCursos": 20,
  "totalMatriculas": 350,
  "usuariosPorRol": [...],
  "chartData": [...]
}
```

### Reportes

| Método | Ruta | Descripción | Roles |
|---|---|---|---|
| `GET` | `/reportes/resumen` | Resumen de todos los módulos | Admin |
| `GET` | `/reportes/exportar/excel` | Descargar reporte en Excel | Admin |
| `GET` | `/reportes/exportar/pdf` | Descargar reporte en PDF | Admin |

### Foros

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/foros/curso/:cursoId` | Foros de un curso |
| `POST` | `/foros` | Crear foro |
| `GET` | `/foros/:foroId/hilos` | Hilos de un foro |
| `POST` | `/foros/:foroId/hilos` | Crear hilo |
| `POST` | `/foros/hilos/:hiloId/responder` | Responder a un hilo |

---

## Roles y permisos

El sistema maneja 3 roles principales:

### Admin
- Acceso completo a todos los módulos
- Puede crear, editar y eliminar usuarios, cursos y contenido
- Único con acceso a Reportes y Pagos
- Ve estadísticas institucionales globales en el Dashboard

### Docente
- Registra notas bimestrales de sus cursos
- Toma asistencia diaria
- Publica tareas, clases virtuales y recursos
- Crea circulares y foros
- Ve solo sus propios cursos y estudiantes

### Estudiante
- Consulta sus notas, asistencia e historial académico
- Entrega tareas
- Accede a material, recursos y clases virtuales
- Participa en foros y mensajería
- Ve circulares dirigidas a estudiantes

---

## Despliegue en producción

### Frontend — Vercel

**URL:** `https://campus-virtual-rho.vercel.app`

Configuración en `vercel.json`:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Variables de entorno en Vercel:
```
VITE_API_URL=https://campus-virtual-077o.onrender.com/api
```

### Backend — Render

**URL:** `https://campus-virtual-077o.onrender.com`

Variables de entorno en Render:
```
NODE_ENV=production
PORT=3000
DB_HOST=<host-de-neon-o-supabase>
DB_PORT=5432
DB_NAME=educolegio
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
JWT_SECRET=<clave-secreta-minimo-32-caracteres>
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://campus-virtual-rho.vercel.app,https://campus-virtual-git-main-fayerbs-projects.vercel.app
```

### Comando de inicio en Render

```bash
node server.js
```

---

## Seguridad

- **JWT**: el servidor no arranca si `JWT_SECRET` tiene menos de 32 caracteres
- **Contraseñas**: cifradas con bcrypt (10 rounds), nunca se almacenan en texto plano
- **Rate limiting**: 200 peticiones/15 min general, 10/15 min en login, 10/hora en reportes
- **Helmet**: cabeceras de seguridad HTTP activadas por defecto
- **CORS**: solo acepta peticiones de los orígenes configurados en `CORS_ORIGIN`
- **Validación**: todos los cuerpos de petición son validados con Joi antes de procesarse
- **Roles**: cada endpoint verifica el rol del usuario antes de ejecutar la lógica

---

## Equipo de desarrollo

| Integrante | Rol | Área |
|---|---|---|
| **Fayer Borda** | Líder técnico | Autenticación, despliegue, arquitectura |
| **Jhordan Quispe** | Frontend | Componentes, navegación, responsive |
| **Alonso Mamani** | Backend | Endpoints REST, validaciones, controladores |
| **Eva Condori** | Base de datos | Esquema, migraciones, optimización |
| **Jhoan Flores** | QA / Documentación | Pruebas, Postman, documentación |

---

## Licencia

Proyecto académico — EduColegio © 2026. Todos los derechos reservados.
