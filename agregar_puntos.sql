-- Agregar columna puntos a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0;

-- Comentario para documentación
COMMENT ON COLUMN users.puntos IS 'Puntos acumulados por compras. Rango: 20-500 puntos por pedido según precio y cantidad';

-- Actualizar puntos de usuarios existentes (opcional, si quieres dar puntos retroactivos)
-- UPDATE users SET puntos = 0 WHERE puntos IS NULL;
