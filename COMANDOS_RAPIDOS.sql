-- ============================================
-- COMANDOS RÁPIDOS - Ejecuta estos 3 bloques
-- ============================================

-- BLOQUE 1: Agregar columna MARCA en users
ALTER TABLE users ADD COLUMN IF NOT EXISTS marca VARCHAR(100);
UPDATE users SET marca = 'Sin marca' WHERE marca IS NULL OR marca = '';

-- BLOQUE 2: Verificar columna PUNTOS en users
ALTER TABLE users ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0;
UPDATE users SET puntos = 0 WHERE puntos IS NULL;

-- BLOQUE 3: Crear tabla DATOS_ENVIO
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
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_datos_envio_pedido ON datos_envio(pedido_id);
CREATE INDEX IF NOT EXISTS idx_datos_envio_usuario ON datos_envio(usuario);

-- ============================================
-- VERIFICACIÓN (Opcional)
-- ============================================

-- Ver usuarios con puntos y marca
SELECT id, name, email, puntos, marca FROM users LIMIT 5;

-- Ver si la tabla datos_envio existe
SELECT * FROM datos_envio LIMIT 1;
