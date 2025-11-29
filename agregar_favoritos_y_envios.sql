-- 1. Agregar columna favoritos a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS favoritos TEXT DEFAULT '[]';

-- 2. Crear tabla para datos de envío y cobro
CREATE TABLE IF NOT EXISTS datos_envio (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    usuario TEXT NOT NULL,
    
    -- Datos de entrega
    nombre_completo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    direccion TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    estado TEXT NOT NULL,
    codigo_postal TEXT NOT NULL,
    referencias TEXT,
    
    -- Datos de cobro
    metodo_pago TEXT NOT NULL, -- 'tarjeta', 'efectivo', 'transferencia'
    
    -- Si es tarjeta (estos campos pueden ser NULL si es efectivo)
    nombre_tarjeta TEXT,
    numero_tarjeta TEXT,
    fecha_expiracion TEXT,
    cvv TEXT,
    
    fecha_registro TIMESTAMP DEFAULT NOW()
);


-- Comentarios para documentación
COMMENT ON TABLE datos_envio IS 'Almacena información de envío y cobro para cada pedido';
COMMENT ON COLUMN datos_envio.metodo_pago IS 'Método de pago: tarjeta, efectivo, transferencia';
