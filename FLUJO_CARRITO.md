# Flujo del Sistema de Carrito

## 📦 Estructura de Datos

### Usuario en BD (tabla `users`)
```json
{
  "email": "usuario@email.com",
  "name": "Usuario",
  "carrito": "[\"1\",\"1\",\"2\",\"3\",\"3\",\"3\"]"
}
```

### Pedido en BD (tabla `pedidos`)
```sql
id | usuario              | productos      | entregado | fecha
---+---------------------+----------------+-----------+------------------------
1  | usuario@email.com   | {1,1,2,3,3,3}  | false     | 2024-01-15 10:30:00
```

## 🔄 Flujo de Operaciones

### 1. Añadir Producto al Carrito
```
Usuario hace click en "Añadir al Carrito"
    ↓
addOneToCart(productId) en cart.js
    ↓
POST /.netlify/functions/addToCart
    ↓
BD: UPDATE users SET carrito = '["1","1","2"]' WHERE email = 'usuario@email.com'
    ↓
Actualiza localStorage
    ↓
Actualiza badge del carrito
    ↓
Recarga vista del carrito
```

### 2. Ver Carrito
```
Usuario hace click en botón "Carrito"
    ↓
loadCart() en cart.js
    ↓
POST /.netlify/functions/getCart
    ↓
BD: SELECT carrito FROM users WHERE email = 'usuario@email.com'
    ↓
BD: SELECT * FROM productos WHERE id = ANY(ARRAY[1,2,3])
    ↓
Agrupa productos por ID y cuenta cantidades
    ↓
Muestra en modal:
  - Producto 1: $10.00 x 2 = $20.00 [+] [-]
  - Producto 2: $15.00 x 1 = $15.00 [+] [-]
  - Producto 3: $8.00 x 3 = $24.00 [+] [-]
  - Total: $59.00
```

### 3. Quitar Producto del Carrito
```
Usuario hace click en botón [-]
    ↓
removeOneFromCart(productId) en cart.js
    ↓
POST /.netlify/functions/removeFromCart
    ↓
BD: Obtiene carrito actual: ["1","1","2","3","3","3"]
    ↓
Elimina primera ocurrencia del ID: ["1","2","3","3","3"]
    ↓
BD: UPDATE users SET carrito = '["1","2","3","3","3"]'
    ↓
Actualiza localStorage
    ↓
Actualiza badge
    ↓
Recarga vista del carrito
```

### 4. Finalizar Compra
```
Usuario hace click en "Finalizar Compra"
    ↓
finalizarCompra() en cart.js
    ↓
POST /.netlify/functions/finalizarCompra
    ↓
BD: SELECT carrito FROM users WHERE email = 'usuario@email.com'
    ↓
Convierte strings a integers: ["1","1","2"] → [1,1,2]
    ↓
BD: INSERT INTO pedidos (usuario, productos, entregado) 
    VALUES ('usuario@email.com', ARRAY[1,1,2], false)
    ↓
BD: UPDATE users SET carrito = '[]' WHERE email = 'usuario@email.com'
    ↓
Limpia localStorage
    ↓
Muestra mensaje: "¡Compra finalizada correctamente!"
    ↓
Cierra modal del carrito
```

## 🎯 Archivos Involucrados

### Backend (Netlify Functions)
- `netlify/functions/addToCart.js` - Añade producto al carrito
- `netlify/functions/getCart.js` - Obtiene productos del carrito
- `netlify/functions/removeFromCart.js` - Elimina producto del carrito
- `netlify/functions/finalizarCompra.js` - Crea pedido y limpia carrito

### Frontend
- `public/cart.js` - Lógica del carrito (nuevo)
- `public/index.html` - UI del modal del carrito

### Base de Datos
- Tabla `users` - Almacena carrito como JSON string
- Tabla `productos` - Catálogo de productos
- Tabla `pedidos` - Historial de compras

## 💡 Características Clave

✅ **Cantidades Dinámicas**: Los productos pueden repetirse en el array para representar cantidad

✅ **Actualización en Tiempo Real**: Cada cambio actualiza BD y UI inmediatamente

✅ **Persistencia Dual**: Datos en localStorage (rápido) y BD (permanente)

✅ **Badge Inteligente**: Muestra número total de items en el carrito

✅ **Conversión Automática**: Strings → Integers al crear pedido

✅ **Validación**: Verifica usuario logueado y carrito no vacío

✅ **Feedback Visual**: Mensajes de éxito/error en cada operación

## 🔍 Ejemplo Completo

### Estado Inicial
```
Carrito: []
Badge: oculto
```

### Usuario añade 2x Producto #1 y 1x Producto #2
```
Click "Añadir" en Producto #1
  → Carrito: ["1"]
  → Badge: 1

Click "Añadir" en Producto #1 otra vez
  → Carrito: ["1","1"]
  → Badge: 2

Click "Añadir" en Producto #2
  → Carrito: ["1","1","2"]
  → Badge: 3
```

### Usuario abre el carrito
```
Modal muestra:
  Producto #1: $10.00 x 2 = $20.00 [+] [-]
  Producto #2: $15.00 x 1 = $15.00 [+] [-]
  Total: $35.00
```

### Usuario quita 1x Producto #1
```
Click [-] en Producto #1
  → Carrito: ["1","2"]
  → Badge: 2
  → Modal actualiza:
      Producto #1: $10.00 x 1 = $10.00 [+] [-]
      Producto #2: $15.00 x 1 = $15.00 [+] [-]
      Total: $25.00
```

### Usuario finaliza compra
```
Click "Finalizar Compra"
  → Crea pedido en BD:
      id: 1
      usuario: "usuario@email.com"
      productos: {1,2}
      entregado: false
      fecha: NOW()
  → Limpia carrito: []
  → Badge: oculto
  → Mensaje: "¡Compra finalizada correctamente!"
```

## 🛠️ Mantenimiento

### Ver todos los pedidos
```sql
SELECT 
  p.id,
  p.usuario,
  p.productos,
  p.entregado,
  p.fecha,
  array_length(p.productos, 1) as total_items
FROM pedidos p
ORDER BY p.fecha DESC;
```

### Ver productos de un pedido específico
```sql
SELECT 
  pr.id,
  pr.nombre,
  pr.precio,
  COUNT(*) as cantidad
FROM pedidos p
CROSS JOIN LATERAL unnest(p.productos) AS producto_id
JOIN productos pr ON pr.id = producto_id
WHERE p.id = 1
GROUP BY pr.id, pr.nombre, pr.precio;
```

### Marcar pedido como entregado
```sql
UPDATE pedidos 
SET entregado = true 
WHERE id = 1;
```
