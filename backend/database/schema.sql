-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla principal de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     VARCHAR(100) NOT NULL,
  apellido   VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  rol        VARCHAR(20)  NOT NULL DEFAULT 'estudiante'
               CONSTRAINT usuarios_rol_check
               CHECK (rol IN ('estudiante', 'docente', 'admin')),
  activo     BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol   ON usuarios(rol);

-- Tabla de noticias
CREATE TABLE IF NOT EXISTS noticias (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      VARCHAR(150) NOT NULL,
  resumen     VARCHAR(300) NOT NULL,
  contenido   TEXT         NOT NULL,
  categoria   VARCHAR(50)  NOT NULL DEFAULT 'General',
  imagen_url  TEXT,
  autor_id    UUID         NOT NULL REFERENCES usuarios(id),
  publicado   BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON noticias(categoria);
CREATE INDEX IF NOT EXISTS idx_noticias_publicado  ON noticias(publicado);

-- Tabla de cursos
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

CREATE INDEX IF NOT EXISTS idx_cursos_docente ON cursos(docente_id);
CREATE INDEX IF NOT EXISTS idx_cursos_activo  ON cursos(activo);

-- Tabla de matrículas
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

-- Tabla de notas (una fila por estudiante + curso)
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

-- Tabla de asistencias (una fila por estudiante + curso + fecha)
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

CREATE INDEX IF NOT EXISTS idx_asistencias_curso  ON asistencias(curso_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha  ON asistencias(fecha);
