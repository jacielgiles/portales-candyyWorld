-- ============================================
-- SOLUCIÓN COMPLETA: PUNTOS, MARCA Y DATOS DE COMPRA
-- ============================================
-- Ejecuta estos comandos en orden en tu base de datos Neon

-- ============================================
-- PARTE 1: COLUMNA MARCA EN USERS
-- ============================================

-- 1.1 Verificar si existe la columna marca en users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'marca';

-- 1.2 Agregar columna marca si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS marca VARCHAR(100);

-- 1.3 Actualizar usuarios con marca por defecto
UPDATE users SET marca = 'Sin marca' WHERE marca IS NULL OR marca = '';

-- 1.4 Verificar que se agregó correctamente
SELECT id, name, email, marca, puntos FROM users LIMIT 5;


-- ============================================
-- PARTE 2: COLUMNA PUNTOS EN USERS
-- ============================================

-- 2.1 Verificar si existe la columna puntos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'puntos';

-- 2.2 Agregar columna puntos si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS puntos INTEGER DEFAULT 0;

-- 2.3 Asegurar que todos los usuarios tengan puntos inicializados
UPDATE users SET puntos = 0 WHERE puntos IS NULL;

-- 2.4 Verificar puntos de usuarios
SELECT id, name, email, puntos, pedidos FROM users;


-- ============================================
-- PARTE 3: TABLA DATOS_ENVIO (Datos de cada compra)
-- ============================================

-- 3.1 Verificar si la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'datos_envio';

-- 3.2 Crear tabla datos_envio
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

-- 3.3 Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_datos_envio_pedido ON datos_envio(pedido_id);
CREATE INDEX IF NOT EXISTS idx_datos_envio_usuario ON datos_envio(usuario);

-- 3.4 Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'datos_envio'
ORDER BY ordinal_position;


-- ============================================
-- PARTE 4: VERIFICACIÓN COMPLETA DEL SISTEMA
-- ============================================

-- 4.1 Ver todas las tablas del sistema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 4.2 Ver estructura completa de users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 4.3 Ver estructura completa de productos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'productos'
ORDER BY ordinal_position;

-- 4.4 Ver estructura completa de pedidos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- 4.5 Ver datos de envío guardados
SELECT * FROM datos_envio ORDER BY fecha_registro DESC LIMIT 10;

-- 4.6 Ver usuarios con sus puntos
SELECT id, name, email, puntos, pedidos, marca 
FROM users 
ORDER BY puntos DESC;


-- ============================================
-- PARTE 5: COMANDOS ÚTILES PARA PRUEBAS
-- ============================================

-- 5.1 Agregar puntos a un usuario específico (para pruebas)
-- UPDATE users SET puntos = 500 WHERE email = 'tu_email@ejemplo.com';

-- 5.2 Ver pedidos con sus datos de envío
-- SELECT p.id, p.usuario, p.fecha, p.entregado, 
--        d.nombre_completo, d.ciudad, d.metodo_pago
-- FROM pedidos p
-- LEFT JOIN datos_envio d ON p.id = d.pedido_id
-- ORDER BY p.fecha DESC;

-- 5.3 Resetear puntos de todos los usuarios (CUIDADO!)
-- UPDATE users SET puntos = 0;

-- 5.4 Ver estadísticas de puntos
-- SELECT 
--   COUNT(*) as total_usuarios,
--   AVG(puntos) as promedio_puntos,
--   MAX(puntos) as max_puntos,
--   MIN(puntos) as min_puntos
-- FROM users;


-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. Los puntos se calculan automáticamente al finalizar una compra
-- 2. Fórmula: 20 puntos base + (total * 0.5) + (cantidad * 10)
-- 3. Máximo 500 puntos por compra
-- 4. Descuento: 1% por cada 100 puntos (máximo 20%)
-- 5. Los puntos usados se restan automáticamente
-- 6. Los datos de envío se guardan en cada pedido
-- 
-- ============================================
