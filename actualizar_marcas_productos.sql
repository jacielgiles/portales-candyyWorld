-- Actualizar marcas de productos existentes
-- Ejecuta este SQL para agregar marcas a tus productos

-- Productos de ejemplo (ajusta los IDs según tu base de datos)
UPDATE productos SET marca = 'De la Rosa' WHERE id = 16 OR nombre LIKE '%Mazapán%';
UPDATE productos SET marca = 'Ricolino' WHERE id = 21 OR nombre LIKE '%Panditas%';
UPDATE productos SET marca = 'Libre' WHERE id = 37 OR nombre LIKE '%Ate%';

-- Si quieres ver todos los productos sin marca:
-- SELECT id, nombre, marca FROM productos WHERE marca IS NULL OR marca = '';

-- Para actualizar todos los productos sin marca con una marca genérica:
-- UPDATE productos SET marca = 'Sin marca' WHERE marca IS NULL OR marca = '';
