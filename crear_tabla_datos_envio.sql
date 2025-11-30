-- ============================================
-- CREAR TABLA DATOS_ENVIO (Datos de cada compra)
-- ============================================

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'datos_envio';

-- 2. CREAR TABLA DATOS_ENVIO
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

-- 3. CREAR ÍNDICE PARA BÚSQUEDAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_datos_envio_pedido ON datos_envio(pedido_id);
CREATE INDEX IF NOT EXISTS idx_datos_envio_usuario ON datos_envio(usuario);

-- 4. VERIFICAR QUE LA TABLA SE CREÓ CORRECTAMENTE
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'datos_envio'
ORDER BY ordinal_position;

-- 5. VER DATOS DE ENVÍO GUARDADOS
SELECT * FROM datos_envio ORDER BY fecha_registro DESC;

-- ============================================
-- NOTA: Esta tabla guarda los datos de envío
-- de cada pedido realizado
-- ============================================
