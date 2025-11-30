-- ============================================
-- MIGRACIONES COMPLETAS - CandyyWorld
-- ============================================
-- Ejecutar estas migraciones en orden si aún no se han aplicado

-- 1. Agregar columna de puntos a usuarios
ALTER TABLE users ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0;

-- 2. Agregar columna de pedidos a usuarios
ALTER TABLE users ADD COLUMN IF NOT EXISTS pedidos INTEGER DEFAULT 0;

-- 3. Agregar columna de marca a productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS marca VARCHAR(100);

-- 4. Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(255) NOT NULL,
  productos INTEGER[] NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  entregado BOOLEAN DEFAULT FALSE
);

-- 5. Crear tabla de datos de envío
CREATE TABLE IF NOT EXISTS datos_envio (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
  usuario VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  codigo_postal VARCHAR(20),
  referencias TEXT,
  metodo_pago VARCHAR(50),
  nombre_tarjeta VARCHAR(255),
  numero_tarjeta VARCHAR(20),
  fecha_expiracion VARCHAR(10),
  cvv VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Crear tabla de datos de envío guardados (para autocompletar)
CREATE TABLE IF NOT EXISTS datos_envio_guardados (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(255) NOT NULL UNIQUE,
  nombre_completo VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  codigo_postal VARCHAR(20),
  referencias TEXT,
  metodo_pago_preferido VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_datos_envio_pedido ON datos_envio(pedido_id);
CREATE INDEX IF NOT EXISTS idx_datos_envio_guardados_usuario ON datos_envio_guardados(usuario);
CREATE INDEX IF NOT EXISTS idx_productos_marca ON productos(marca);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

-- 8. Agregar columnas de favoritos y envíos si no existen
ALTER TABLE users ADD COLUMN IF NOT EXISTS favoritos TEXT DEFAULT '[]';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecutar estas consultas para verificar que todo está correcto:

-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'productos';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
