-- ============================================
-- COMANDOS SQL COMPLETOS - ACTUALIZADO
-- ============================================

-- ============================================
-- PARTE A: PRODUCTOS - COLUMNA MARCA
-- ============================================

-- 1. VERIFICAR SI LA COLUMNA MARCA EXISTE EN PRODUCTOS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productos' AND column_name = 'marca';

-- 2. SI NO EXISTE, AGREGARLA
ALTER TABLE productos ADD COLUMN IF NOT EXISTS marca VARCHAR(100);

-- 3. ACTUALIZAR PRODUCTOS CON MARCAS (ajusta los IDs según tus productos)
UPDATE productos SET marca = 'De la Rosa' WHERE nombre LIKE '%Mazapán%' OR nombre LIKE '%mazapan%';
UPDATE productos SET marca = 'Ricolino' WHERE nombre LIKE '%Panditas%' OR nombre LIKE '%panditas%';
UPDATE productos SET marca = 'Libre' WHERE nombre LIKE '%Ate%' OR nombre LIKE '%ate%';
UPDATE productos SET marca = 'Hershey''s' WHERE nombre LIKE '%Hershey%' OR nombre LIKE '%chocolate%';
UPDATE productos SET marca = 'Ferrero' WHERE nombre LIKE '%Ferrero%' OR nombre LIKE '%Rocher%';

-- 4. VER TODOS LOS PRODUCTOS Y SUS MARCAS
SELECT id, nombre, marca, precio, stock FROM productos ORDER BY id;

-- 5. ACTUALIZAR PRODUCTOS SIN MARCA CON MARCA GENÉRICA
UPDATE productos SET marca = 'Sin marca' WHERE marca IS NULL OR marca = '';

-- ============================================
-- TABLA DATOS_ENVIO_GUARDADOS
-- ============================================

-- 6. VERIFICAR SI LA TABLA EXISTE
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'datos_envio_guardados';

-- 7. CREAR TABLA SI NO EXISTE
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

-- 8. CREAR ÍNDICE PARA BÚSQUEDAS RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_datos_envio_usuario ON datos_envio_guardados(usuario);

-- 9. VER DATOS GUARDADOS
SELECT * FROM datos_envio_guardados;

-- ============================================
-- VERIFICAR COLUMNA PUNTOS EN USERS
-- ============================================

-- 10. VERIFICAR SI LA COLUMNA PUNTOS EXISTE
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'puntos';

-- 11. SI NO EXISTE, AGREGARLA
ALTER TABLE users ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0;

-- 12. VER USUARIOS Y SUS PUNTOS
SELECT id, name, email, puntos, pedidos FROM users;

-- 13. ACTUALIZAR PUNTOS DE UN USUARIO (ejemplo)
-- UPDATE users SET puntos = 100 WHERE email = 'tu_email@ejemplo.com';

-- ============================================
-- TABLA DATOS_ENVIO (para cada pedido)
-- ============================================

-- 14. VERIFICAR SI LA TABLA EXISTE
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'datos_envio';

-- 15. CREAR TABLA SI NO EXISTE
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

-- 16. CREAR ÍNDICE
CREATE INDEX IF NOT EXISTS idx_datos_envio_pedido ON datos_envio(pedido_id);

-- ============================================
-- VERIFICAR TODO EL SISTEMA
-- ============================================

-- 17. VER TODAS LAS TABLAS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 18. VER ESTRUCTURA DE PRODUCTOS
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'productos'
ORDER BY ordinal_position;

-- 19. VER ESTRUCTURA DE USERS
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- LIMPIAR Y RESETEAR (SOLO SI ES NECESARIO)
-- ============================================

-- 20. ELIMINAR TABLA DATOS_ENVIO_GUARDADOS (CUIDADO!)
-- DROP TABLE IF EXISTS datos_envio_guardados;

-- 21. ELIMINAR TABLA DATOS_ENVIO (CUIDADO!)
-- DROP TABLE IF EXISTS datos_envio;

-- 22. RESETEAR PUNTOS DE TODOS LOS USUARIOS
-- UPDATE users SET puntos = 0;

-- ============================================
-- PARTE B: USERS - COLUMNA MARCA
-- ============================================

-- 23. VERIFICAR SI LA COLUMNA MARCA EXISTE EN USERS
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'marca';

-- 24. AGREGAR COLUMNA MARCA EN USERS SI NO EXISTE
ALTER TABLE users ADD COLUMN IF NOT EXISTS marca VARCHAR(100);

-- 25. ACTUALIZAR USUARIOS CON MARCA POR DEFECTO
UPDATE users SET marca = 'Sin marca' WHERE marca IS NULL OR marca = '';

-- 26. VER USUARIOS CON MARCA Y PUNTOS
SELECT id, name, email, marca, puntos, pedidos FROM users;
