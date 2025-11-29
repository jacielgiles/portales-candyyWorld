-- Crear tabla pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    productos INTEGER[] NOT NULL,
    entregado BOOLEAN DEFAULT false,
    fecha TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario);

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha DESC);
