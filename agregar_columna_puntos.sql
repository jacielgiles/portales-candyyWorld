-- Agregar columna de puntos a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0;

-- Actualizar puntos existentes a 0 si son NULL
UPDATE usuarios SET puntos = 0 WHERE puntos IS NULL;
