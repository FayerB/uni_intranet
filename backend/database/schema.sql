-- =====================================================================
-- SCHEMA COMPLETO - CAMPUS VIRTUAL UNIVERSITARIO
-- Versión 2.0 — Ampliado y compatible con versión anterior
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. USUARIOS (ampliado con avatar, teléfono, bio, último acceso)
-- =====================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'estudiante'
                  CONSTRAINT usuarios_rol_check
                  CHECK (rol IN ('estudiante', 'docente', 'admin', 'padre')),
  activo        BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_url     TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono       VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio            TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_acceso  TIMESTAMP;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('estudiante', 'docente', 'admin', 'padre'));

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol   ON usuarios(rol);

-- Vínculo padre → hijo
CREATE TABLE IF NOT EXISTS relaciones_padre_hijo (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  padre_id      UUID      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estudiante_id UUID      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (padre_id, estudiante_id)
);

-- =====================================================================
-- 2. PERÍODOS ACADÉMICOS
-- =====================================================================

CREATE TABLE IF NOT EXISTS periodos_academicos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       VARCHAR(60) NOT NULL,        -- "2025-I"
  fecha_inicio DATE        NOT NULL,
  fecha_fin    DATE        NOT NULL,
  activo       BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 3. NOTICIAS (sin cambios)
-- =====================================================================

CREATE TABLE IF NOT EXISTS noticias (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo     VARCHAR(150) NOT NULL,
  resumen    VARCHAR(300) NOT NULL,
  contenido  TEXT         NOT NULL,
  categoria  VARCHAR(50)  NOT NULL DEFAULT 'General',
  imagen_url TEXT,
  autor_id   UUID         NOT NULL REFERENCES usuarios(id),
  publicado  BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON noticias(categoria);
CREATE INDEX IF NOT EXISTS idx_noticias_publicado  ON noticias(publicado);

-- =====================================================================
-- 4. CURSOS (ampliado con período académico)
-- =====================================================================

CREATE TABLE IF NOT EXISTS cursos (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      VARCHAR(20)  UNIQUE NOT NULL,
  nombre      VARCHAR(120) NOT NULL,
  descripcion TEXT,
  creditos    INT          NOT NULL DEFAULT 3,
  ciclo       VARCHAR(10),
  tipo        VARCHAR(20)  NOT NULL DEFAULT 'Obligatorio',
  imagen_url  TEXT,
  docente_id  UUID         REFERENCES usuarios(id),
  activo      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

ALTER TABLE cursos ADD COLUMN IF NOT EXISTS periodo_id UUID REFERENCES periodos_academicos(id);

CREATE INDEX IF NOT EXISTS idx_cursos_docente ON cursos(docente_id);
CREATE INDEX IF NOT EXISTS idx_cursos_activo  ON cursos(activo);
CREATE INDEX IF NOT EXISTS idx_cursos_periodo ON cursos(periodo_id);

-- =====================================================================
-- 5. MATRÍCULAS (sin cambios)
-- =====================================================================

CREATE TABLE IF NOT EXISTS matriculas (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID        NOT NULL REFERENCES usuarios(id),
  curso_id      UUID        NOT NULL REFERENCES cursos(id),
  estado        VARCHAR(20) NOT NULL DEFAULT 'activo',
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, curso_id)
);

CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante ON matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso      ON matriculas(curso_id);

-- =====================================================================
-- 6. NOTAS (sin cambios)
-- =====================================================================

CREATE TABLE IF NOT EXISTS notas (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id      UUID         NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
  p1            NUMERIC(4,1) NOT NULL DEFAULT 0,
  p2            NUMERIC(4,1) NOT NULL DEFAULT 0,
  ep            NUMERIC(4,1) NOT NULL DEFAULT 0,
  ef            NUMERIC(4,1) NOT NULL DEFAULT 0,
  promedio      NUMERIC(4,1) NOT NULL DEFAULT 0,
  estado        VARCHAR(20)  NOT NULL DEFAULT 'desaprobado',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, curso_id)
);

CREATE INDEX IF NOT EXISTS idx_notas_estudiante ON notas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_notas_curso      ON notas(curso_id);

-- =====================================================================
-- 7. ASISTENCIAS (sin cambios)
-- =====================================================================

CREATE TABLE IF NOT EXISTS asistencias (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id      UUID        NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
  fecha         DATE        NOT NULL DEFAULT CURRENT_DATE,
  estado        VARCHAR(20) NOT NULL DEFAULT 'falta'
                  CHECK (estado IN ('presente', 'tardanza', 'falta')),
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, curso_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_asistencias_curso ON asistencias(curso_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);

-- =====================================================================
-- 8. HORARIOS
-- =====================================================================

CREATE TABLE IF NOT EXISTS horarios (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id    UUID        NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  dia_semana  SMALLINT    NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lun
  hora_inicio TIME        NOT NULL,
  hora_fin    TIME        NOT NULL,
  aula        VARCHAR(30),
  modalidad   VARCHAR(20) NOT NULL DEFAULT 'presencial'
                CHECK (modalidad IN ('presencial', 'virtual', 'hibrido')),
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_horarios_curso ON horarios(curso_id);

-- =====================================================================
-- 9. ARCHIVOS / ALMACENAMIENTO
-- =====================================================================

CREATE TABLE IF NOT EXISTS archivos (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           VARCHAR(255) NOT NULL,
  nombre_original  VARCHAR(255) NOT NULL,
  mime_type        VARCHAR(100) NOT NULL,
  tamano           BIGINT       NOT NULL,        -- bytes
  url              TEXT         NOT NULL,
  storage_key      TEXT         NOT NULL,        -- S3 key o ruta local
  subido_por       UUID         NOT NULL REFERENCES usuarios(id),
  entidad_tipo     VARCHAR(50),                  -- 'tarea', 'recurso', 'entrega'
  entidad_id       UUID,
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archivos_entidad ON archivos(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_archivos_usuario  ON archivos(subido_por);

-- =====================================================================
-- 10. CLASES VIRTUALES
-- =====================================================================

CREATE TABLE IF NOT EXISTS clases_virtuales (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id      UUID         NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  titulo        VARCHAR(150) NOT NULL,
  descripcion   TEXT,
  url_reunion   TEXT,
  plataforma    VARCHAR(30)  DEFAULT 'zoom'
                  CHECK (plataforma IN ('zoom', 'meet', 'teams', 'otro')),
  fecha_inicio  TIMESTAMP    NOT NULL,
  fecha_fin     TIMESTAMP,
  grabacion_url TEXT,
  estado        VARCHAR(20)  NOT NULL DEFAULT 'programada'
                  CHECK (estado IN ('programada', 'en_curso', 'finalizada', 'cancelada')),
  creado_por    UUID         NOT NULL REFERENCES usuarios(id),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clases_curso ON clases_virtuales(curso_id);
CREATE INDEX IF NOT EXISTS idx_clases_fecha ON clases_virtuales(fecha_inicio);

-- =====================================================================
-- 11. RECURSOS EDUCATIVOS / BIBLIOTECA
-- =====================================================================

CREATE TABLE IF NOT EXISTS categorias_recurso (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     VARCHAR(80) NOT NULL UNIQUE,
  color      VARCHAR(20) DEFAULT '#3B82F6',
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS etiquetas (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recursos (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       VARCHAR(200) NOT NULL,
  descripcion  TEXT,
  tipo         VARCHAR(20)  NOT NULL
                 CHECK (tipo IN ('pdf', 'video', 'enlace', 'imagen', 'audio', 'documento', 'otro')),
  url          TEXT,
  archivo_id   UUID         REFERENCES archivos(id),
  curso_id     UUID         REFERENCES cursos(id),
  categoria_id UUID         REFERENCES categorias_recurso(id),
  subido_por   UUID         NOT NULL REFERENCES usuarios(id),
  publicado    BOOLEAN      NOT NULL DEFAULT true,
  descargas    INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurso_etiquetas (
  recurso_id  UUID NOT NULL REFERENCES recursos(id)  ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
  PRIMARY KEY (recurso_id, etiqueta_id)
);

CREATE INDEX IF NOT EXISTS idx_recursos_curso     ON recursos(curso_id);
CREATE INDEX IF NOT EXISTS idx_recursos_tipo      ON recursos(tipo);
CREATE INDEX IF NOT EXISTS idx_recursos_publicado ON recursos(publicado);
CREATE INDEX IF NOT EXISTS idx_recursos_busqueda
  ON recursos USING gin(to_tsvector('spanish', titulo || ' ' || COALESCE(descripcion, '')));

-- =====================================================================
-- 12. TAREAS Y ENTREGAS
-- =====================================================================

CREATE TABLE IF NOT EXISTS tareas (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id                UUID         NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  titulo                  VARCHAR(200) NOT NULL,
  descripcion             TEXT,
  fecha_entrega           TIMESTAMP    NOT NULL,
  puntaje_max             NUMERIC(4,1) NOT NULL DEFAULT 20,
  tipo                    VARCHAR(20)  NOT NULL DEFAULT 'tarea'
                            CHECK (tipo IN ('tarea', 'proyecto', 'laboratorio', 'practica')),
  permite_entrega_tardia  BOOLEAN      NOT NULL DEFAULT false,
  activa                  BOOLEAN      NOT NULL DEFAULT true,
  creado_por              UUID         NOT NULL REFERENCES usuarios(id),
  created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entregas (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id          UUID         NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
  estudiante_id     UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  contenido         TEXT,
  archivo_id        UUID         REFERENCES archivos(id),
  calificacion      NUMERIC(4,1),
  comentario_docente TEXT,
  estado            VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente', 'entregado', 'calificado', 'rechazado')),
  entregado_en      TIMESTAMP,
  calificado_en     TIMESTAMP,
  calificado_por    UUID         REFERENCES usuarios(id),
  created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (tarea_id, estudiante_id)
);

CREATE INDEX IF NOT EXISTS idx_tareas_curso        ON tareas(curso_id);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha        ON tareas(fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_entregas_tarea      ON entregas(tarea_id);
CREATE INDEX IF NOT EXISTS idx_entregas_estudiante ON entregas(estudiante_id);

-- =====================================================================
-- 13. EXÁMENES Y BANCO DE PREGUNTAS
-- =====================================================================

CREATE TABLE IF NOT EXISTS examenes (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id              UUID         NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  titulo                VARCHAR(200) NOT NULL,
  descripcion           TEXT,
  tipo                  VARCHAR(20)  NOT NULL DEFAULT 'parcial'
                          CHECK (tipo IN ('parcial', 'final', 'practica', 'quiz')),
  duracion_minutos      INT          NOT NULL DEFAULT 60,
  puntaje_max           NUMERIC(4,1) NOT NULL DEFAULT 20,
  intentos_max          INT          NOT NULL DEFAULT 1,
  fecha_inicio          TIMESTAMP    NOT NULL,
  fecha_fin             TIMESTAMP    NOT NULL,
  aleatorizar_preguntas BOOLEAN      NOT NULL DEFAULT false,
  aleatorizar_opciones  BOOLEAN      NOT NULL DEFAULT false,
  mostrar_resultados    VARCHAR(20)  NOT NULL DEFAULT 'inmediato'
                          CHECK (mostrar_resultados IN ('inmediato', 'al_cerrar', 'manual')),
  activo                BOOLEAN      NOT NULL DEFAULT true,
  creado_por            UUID         NOT NULL REFERENCES usuarios(id),
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preguntas (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  examen_id   UUID         NOT NULL REFERENCES examenes(id) ON DELETE CASCADE,
  enunciado   TEXT         NOT NULL,
  tipo        VARCHAR(20)  NOT NULL DEFAULT 'multiple'
                CHECK (tipo IN ('multiple', 'verdadero_falso', 'desarrollo', 'completar')),
  puntaje     NUMERIC(4,1) NOT NULL DEFAULT 1,
  orden       INT          NOT NULL DEFAULT 0,
  imagen_url  TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opciones_pregunta (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta_id UUID    NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  texto       TEXT    NOT NULL,
  es_correcta BOOLEAN NOT NULL DEFAULT false,
  orden       INT     NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS intentos_examen (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  examen_id     UUID         NOT NULL REFERENCES examenes(id) ON DELETE CASCADE,
  estudiante_id UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  numero        INT          NOT NULL DEFAULT 1,
  iniciado_en   TIMESTAMP    NOT NULL DEFAULT NOW(),
  finalizado_en TIMESTAMP,
  puntaje       NUMERIC(4,1),
  estado        VARCHAR(20)  NOT NULL DEFAULT 'en_curso'
                  CHECK (estado IN ('en_curso', 'finalizado', 'calificado', 'anulado')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS respuestas_examen (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  intento_id       UUID         NOT NULL REFERENCES intentos_examen(id) ON DELETE CASCADE,
  pregunta_id      UUID         NOT NULL REFERENCES preguntas(id),
  opcion_id        UUID         REFERENCES opciones_pregunta(id),
  respuesta_texto  TEXT,
  es_correcta      BOOLEAN,
  puntaje_obtenido NUMERIC(4,1) DEFAULT 0,
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (intento_id, pregunta_id)
);

CREATE INDEX IF NOT EXISTS idx_examenes_curso       ON examenes(curso_id);
CREATE INDEX IF NOT EXISTS idx_examenes_fecha       ON examenes(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_intentos_examen      ON intentos_examen(examen_id);
CREATE INDEX IF NOT EXISTS idx_intentos_estudiante  ON intentos_examen(estudiante_id);

-- =====================================================================
-- 14. FOROS DE DISCUSIÓN
-- =====================================================================

CREATE TABLE IF NOT EXISTS foros (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id    UUID         NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  titulo      VARCHAR(200) NOT NULL,
  descripcion TEXT,
  activo      BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hilos_foro (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  foro_id    UUID         NOT NULL REFERENCES foros(id) ON DELETE CASCADE,
  titulo     VARCHAR(200) NOT NULL,
  contenido  TEXT         NOT NULL,
  autor_id   UUID         NOT NULL REFERENCES usuarios(id),
  fijado     BOOLEAN      NOT NULL DEFAULT false,
  cerrado    BOOLEAN      NOT NULL DEFAULT false,
  vistas     INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS respuestas_foro (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  hilo_id    UUID      NOT NULL REFERENCES hilos_foro(id) ON DELETE CASCADE,
  contenido  TEXT      NOT NULL,
  autor_id   UUID      NOT NULL REFERENCES usuarios(id),
  padre_id   UUID      REFERENCES respuestas_foro(id),   -- respuesta anidada
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foros_curso  ON foros(curso_id);
CREATE INDEX IF NOT EXISTS idx_hilos_foro   ON hilos_foro(foro_id);
CREATE INDEX IF NOT EXISTS idx_resp_hilo    ON respuestas_foro(hilo_id);

-- =====================================================================
-- 15. MENSAJERÍA INTERNA
-- =====================================================================

CREATE TABLE IF NOT EXISTS conversaciones (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo       VARCHAR(20) NOT NULL DEFAULT 'directa'
               CHECK (tipo IN ('directa', 'grupo')),
  nombre     VARCHAR(100),
  created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participantes_conversacion (
  conversacion_id UUID      NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE,
  usuario_id      UUID      NOT NULL REFERENCES usuarios(id)       ON DELETE CASCADE,
  unido_en        TIMESTAMP NOT NULL DEFAULT NOW(),
  ultimo_leido    TIMESTAMP,
  PRIMARY KEY (conversacion_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS mensajes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID        NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE,
  remitente_id    UUID        NOT NULL REFERENCES usuarios(id),
  contenido       TEXT        NOT NULL,
  tipo            VARCHAR(20) NOT NULL DEFAULT 'texto'
                    CHECK (tipo IN ('texto', 'archivo', 'imagen')),
  archivo_id      UUID        REFERENCES archivos(id),
  created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mensajes_conv    ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_created ON mensajes(created_at);

-- =====================================================================
-- 16. NOTIFICACIONES
-- =====================================================================

CREATE TABLE IF NOT EXISTS notificaciones (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo       VARCHAR(150) NOT NULL,
  mensaje      TEXT         NOT NULL,
  tipo         VARCHAR(30)  NOT NULL DEFAULT 'info'
                 CHECK (tipo IN ('info', 'tarea', 'examen', 'calificacion', 'mensaje', 'alerta', 'sistema')),
  leida        BOOLEAN      NOT NULL DEFAULT false,
  url_accion   TEXT,
  entidad_tipo VARCHAR(50),
  entidad_id   UUID,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_usuario ON notificaciones(usuario_id, leida);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notificaciones(created_at);

-- =====================================================================
-- 17. CALENDARIO DE EVENTOS
-- =====================================================================

CREATE TABLE IF NOT EXISTS eventos_calendario (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       VARCHAR(200) NOT NULL,
  descripcion  TEXT,
  tipo         VARCHAR(30)  NOT NULL DEFAULT 'academico'
                 CHECK (tipo IN ('academico', 'tarea', 'examen', 'clase_virtual', 'feriado', 'otro')),
  fecha_inicio TIMESTAMP    NOT NULL,
  fecha_fin    TIMESTAMP,
  todo_el_dia  BOOLEAN      NOT NULL DEFAULT false,
  curso_id     UUID         REFERENCES cursos(id),
  creado_por   UUID         NOT NULL REFERENCES usuarios(id),
  es_global    BOOLEAN      NOT NULL DEFAULT false,
  color        VARCHAR(20)  DEFAULT '#3B82F6',
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos_calendario(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_curso ON eventos_calendario(curso_id);

-- =====================================================================
-- 18. PAGOS
-- =====================================================================

CREATE TABLE IF NOT EXISTS conceptos_pago (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100)  NOT NULL,
  descripcion TEXT,
  monto       NUMERIC(10,2) NOT NULL,
  activo      BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagos (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id     UUID          NOT NULL REFERENCES usuarios(id),
  concepto_id       UUID          NOT NULL REFERENCES conceptos_pago(id),
  monto             NUMERIC(10,2) NOT NULL,
  estado            VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente', 'pagado', 'vencido', 'anulado')),
  fecha_vencimiento DATE          NOT NULL,
  fecha_pago        DATE,
  referencia        VARCHAR(100),
  comprobante_url   TEXT,
  registrado_por    UUID          REFERENCES usuarios(id),
  created_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_estudiante   ON pagos(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado       ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_vencimiento  ON pagos(fecha_vencimiento);

-- =====================================================================
-- 19. SOPORTE Y TICKETS
-- =====================================================================

CREATE TABLE IF NOT EXISTS tickets_soporte (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID         NOT NULL REFERENCES usuarios(id),
  asunto      VARCHAR(200) NOT NULL,
  descripcion TEXT         NOT NULL,
  categoria   VARCHAR(50)  NOT NULL DEFAULT 'general'
                CHECK (categoria IN ('general', 'tecnico', 'academico', 'pagos', 'acceso')),
  prioridad   VARCHAR(20)  NOT NULL DEFAULT 'media'
                CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  estado      VARCHAR(20)  NOT NULL DEFAULT 'abierto'
                CHECK (estado IN ('abierto', 'en_proceso', 'resuelto', 'cerrado')),
  asignado_a  UUID         REFERENCES usuarios(id),
  resuelto_en TIMESTAMP,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS respuestas_ticket (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID      NOT NULL REFERENCES tickets_soporte(id) ON DELETE CASCADE,
  usuario_id UUID      NOT NULL REFERENCES usuarios(id),
  contenido  TEXT      NOT NULL,
  es_interna BOOLEAN   NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_usuario ON tickets_soporte(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado  ON tickets_soporte(estado);

-- =====================================================================
-- 20. CONFIGURACIÓN DEL SISTEMA
-- =====================================================================

CREATE TABLE IF NOT EXISTS configuracion_sistema (
  clave       VARCHAR(100) PRIMARY KEY,
  valor       TEXT         NOT NULL,
  descripcion VARCHAR(255),
  tipo        VARCHAR(20)  NOT NULL DEFAULT 'texto'
                CHECK (tipo IN ('texto', 'numero', 'booleano', 'json', 'color')),
  categoria   VARCHAR(50)  NOT NULL DEFAULT 'general',
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

INSERT INTO configuracion_sistema (clave, valor, descripcion, tipo, categoria) VALUES
  ('nombre_institucion',  'Mi Universidad',   'Nombre de la institución',       'texto',    'general'),
  ('logo_url',            '',                 'URL del logo institucional',     'texto',    'general'),
  ('color_primario',      '#1e3a5f',          'Color primario del sistema',     'color',    'apariencia'),
  ('color_secundario',    '#0ea5e9',          'Color secundario',               'color',    'apariencia'),
  ('nota_aprobacion',     '11',               'Nota mínima para aprobar',       'numero',   'evaluaciones'),
  ('max_intentos_examen', '3',                'Máx intentos por examen',        'numero',   'evaluaciones'),
  ('notif_email_activo',  'false',            'Activar notificaciones email',   'booleano', 'notificaciones'),
  ('s3_activo',           'false',            'Usar AWS S3 para archivos',      'booleano', 'almacenamiento'),
  ('s3_bucket',           '',                 'Bucket S3',                      'texto',    'almacenamiento'),
  ('zoom_api_key',        '',                 'API Key de Zoom',                'texto',    'integraciones')
ON CONFLICT (clave) DO NOTHING;

-- =====================================================================
-- 21. PROGRESO Y ANALÍTICA
-- =====================================================================

CREATE TABLE IF NOT EXISTS progreso_estudiante (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id     UUID         NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id          UUID         NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
  recursos_vistos   INT          NOT NULL DEFAULT 0,
  tareas_entregadas INT          NOT NULL DEFAULT 0,
  examenes_rendidos INT          NOT NULL DEFAULT 0,
  porcentaje        NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (estudiante_id, curso_id)
);

CREATE TABLE IF NOT EXISTS actividad_usuario (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id   UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  accion       VARCHAR(50) NOT NULL,   -- 'login', 'ver_recurso', 'entregar_tarea'
  entidad_tipo VARCHAR(50),
  entidad_id   UUID,
  metadata     JSONB,
  ip_address   INET,
  created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actividad_usuario ON actividad_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_actividad_created ON actividad_usuario(created_at);

-- =====================================================================
-- 22. ALERTAS AUTOMÁTICAS
-- =====================================================================

CREATE TABLE IF NOT EXISTS alertas (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  curso_id      UUID        REFERENCES cursos(id),
  tipo          VARCHAR(30) NOT NULL
                  CHECK (tipo IN ('bajo_rendimiento', 'inasistencia', 'tarea_pendiente', 'pago_vencido')),
  mensaje       TEXT        NOT NULL,
  resuelta      BOOLEAN     NOT NULL DEFAULT false,
  notificado    BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertas_estudiante ON alertas(estudiante_id, resuelta);


-- =====================================================================
-- 23. CIRCULARES / COMUNICADOS
-- =====================================================================

CREATE TABLE IF NOT EXISTS circulares (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       VARCHAR(200) NOT NULL,
  contenido    TEXT         NOT NULL,
  destinatario VARCHAR(20)  NOT NULL DEFAULT 'todos'
                 CHECK (destinatario IN ('todos', 'docentes', 'estudiantes')),
  autor_id     UUID         NOT NULL REFERENCES usuarios(id),
  activo       BOOLEAN      NOT NULL DEFAULT true,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circulares_leidas (
  circular_id UUID      NOT NULL REFERENCES circulares(id) ON DELETE CASCADE,
  usuario_id  UUID      NOT NULL REFERENCES usuarios(id)   ON DELETE CASCADE,
  leida_en    TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (circular_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_circulares_autor        ON circulares(autor_id);
CREATE INDEX IF NOT EXISTS idx_circulares_destinatario ON circulares(destinatario, activo);
CREATE INDEX IF NOT EXISTS idx_circulares_leidas_user  ON circulares_leidas(usuario_id);
