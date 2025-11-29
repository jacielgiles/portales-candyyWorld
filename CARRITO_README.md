# Sistema de Carrito de Compras - Instrucciones

## Cambios Realizados

### 1. Funciones del Backend Creadas

#### `netlify/functions/removeFromCart.js`
- Elimina una unidad de un producto del carrito
- Recibe: `email` y `productId`
- Actualiza el carrito en la base de datos

#### `netlify/functions/finalizarCompra.js`
- Finaliza la compra y crea un pedido
- Convierte los IDs del carrito (strings) a integers para PostgreSQL
- Inserta el pedido en la tabla `pedidos`
- Limpia el carrito del usuario

### 2. Frontend Actualizado

#### `public/cart.js`
Nuevo archivo con las funciones del carrito:
- `loadCart()`: Carga los productos del carrito desde la BD
- `addOneToCart(productId)`: Añade una unidad de un producto
- `removeOneFromCart(productId)`: Elimina una unidad de un producto
- `finalizarCompra()`: Finaliza la compra y crea el pedido

#### `public/index.html`
- Incluye el archivo `cart.js`
- El botón "Finalizar Compra" llama a `finalizarCompra()`
- El modal del carrito muestra:
  - Imagen del producto
  - Nombre y precio
  - Cantidad de cada producto
  - Botones + y - para añadir/quitar
  - Total calculado correctamente

### 3. Base de Datos

#### Tabla `pedidos`
```sql
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    productos INTEGER[] NOT NULL,
    entregado BOOLEAN DEFAULT false,
    fecha TIMESTAMP DEFAULT NOW()
);
```

## Cómo Usar

### 1. Crear la Tabla en la Base de Datos
Ejecuta el archivo `create_pedidos_table.sql` en tu base de datos PostgreSQL (Neon):

```bash
psql -h tu-host -U tu-usuario -d tu-database -f create_pedidos_table.sql
```

O copia y pega el contenido en la consola SQL de Neon.

### 2. Funcionalidad del Carrito

#### Añadir Productos
Los productos se añaden al carrito desde la página de productos usando la función `addToCart()` existente.

#### Ver el Carrito
- Click en el botón "Carrito" en el header
- Se muestra el modal con todos los productos
- Cada producto muestra:
  - Imagen
  - Nombre
  - Precio unitario
  - Cantidad
  - Subtotal
  - Botones + y - para modificar cantidad

#### Modificar Cantidades
- Botón `+`: Añade una unidad del producto
- Botón `-`: Elimina una unidad del producto
- Si se elimina la última unidad, el producto desaparece del carrito

#### Finalizar Compra
- Click en "Finalizar Compra"
- Se crea un registro en la tabla `pedidos` con:
  - Email del usuario
  - Array de IDs de productos (como integers)
  - Estado: no entregado
  - Fecha actual
- El carrito se vacía automáticamente
- Se muestra mensaje de confirmación

### 3. Formato de Datos

#### Carrito en `users.carrito`
```json
["1","1","1","2","3","3"]
```
Array de strings con IDs de productos (pueden repetirse)

#### Pedidos en `pedidos.productos`
```sql
{1,1,1,2,3,3}
```
Array de integers en PostgreSQL

## Verificar Pedidos

Para ver los pedidos en la base de datos:

```sql
SELECT * FROM pedidos ORDER BY fecha DESC;
```

Para ver los pedidos de un usuario específico:

```sql
SELECT * FROM pedidos WHERE usuario = 'usuario@email.com' ORDER BY fecha DESC;
```

Para ver los detalles de los productos de un pedido:

```sql
SELECT p.*, pr.nombre, pr.precio 
FROM pedidos p
CROSS JOIN LATERAL unnest(p.productos) AS producto_id
JOIN productos pr ON pr.id = producto_id
WHERE p.id = 1;
```

## Notas Importantes

1. **Conversión de Tipos**: Los IDs en el carrito son strings pero se convierten a integers antes de guardar en `pedidos`

2. **Duplicados**: Los productos pueden aparecer múltiples veces en el array (representando cantidad)

3. **Badge del Carrito**: Se actualiza automáticamente mostrando el número total de items

4. **Persistencia**: El carrito se guarda en localStorage y en la base de datos

5. **Sincronización**: Cada operación actualiza tanto localStorage como la base de datos

## Troubleshooting

### El carrito no se carga
- Verifica que el usuario esté logueado
- Revisa la consola del navegador para errores
- Verifica que la función `getCart` esté funcionando

### Error al finalizar compra
- Verifica que la tabla `pedidos` exista
- Revisa que los IDs de productos sean válidos
- Verifica la conexión a la base de datos

### Los productos no se muestran correctamente
- Verifica que la tabla `productos` tenga los campos: `id`, `nombre`, `precio`, `imagen`
- Revisa que los IDs en el carrito correspondan a productos existentes
