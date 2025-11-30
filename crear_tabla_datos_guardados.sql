-- ============================================
-- CREAR TABLA DATOS_ENVIO_GUARDADOS
-- ============================================
-- Esta tabla guarda los datos de envío del usuario
-- para usarlos en futuras compras

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

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_datos_guardados_usuario ON datos_envio_guardados(usuario);

-- Verificar que se creó correctamente
SELECT * FROM datos_envio_guardados LIMIT 1;
