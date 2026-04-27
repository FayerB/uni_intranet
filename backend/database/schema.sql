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
