# Pruebas del Sistema de Carrito

## ✅ Checklist de Pruebas

### 1. Preparación
- [ ] Crear tabla `pedidos` en la base de datos usando `create_pedidos_table.sql`
- [ ] Verificar que la tabla `users` tenga la columna `carrito` (tipo TEXT)
- [ ] Verificar que la tabla `productos` exista con productos de prueba
- [ ] Desplegar las funciones de Netlify

### 2. Pruebas de Añadir al Carrito
- [ ] Iniciar sesión con un usuario
- [ ] Añadir un producto al carrito
- [ ] Verificar que el badge muestre "1"
- [ ] Añadir el mismo producto otra vez
- [ ] Verificar que el badge muestre "2"
- [ ] Añadir un producto diferente
- [ ] Verificar que el badge muestre "3"

### 3. Pruebas de Ver Carrito
- [ ] Hacer click en el botón "Carrito"
- [ ] Verificar que se abra el modal
- [ ] Verificar que se muestren todos los productos
- [ ] Verificar que las cantidades sean correctas
- [ ] Verificar que los precios sean correctos
- [ ] Verificar que el total sea correcto
- [ ] Verificar que las imágenes se carguen

### 4. Pruebas de Modificar Cantidades
- [ ] Hacer click en el botón [+] de un producto
- [ ] Verificar que la cantidad aumente
- [ ] Verificar que el subtotal se actualice
- [ ] Verificar que el total se actualice
- [ ] Verificar que el badge se actualice
- [ ] Hacer click en el botón [-] de un producto
- [ ] Verificar que la cantidad disminuya
- [ ] Verificar que el subtotal se actualice
- [ ] Verificar que el total se actualice
- [ ] Verificar que el badge se actualice

### 5. Pruebas de Eliminar Producto
- [ ] Hacer click en [-] hasta que la cantidad sea 0
- [ ] Verificar que el producto desaparezca del carrito
- [ ] Verificar que el total se actualice
- [ ] Verificar que el badge se actualice

### 6. Pruebas de Finalizar Compra
- [ ] Añadir varios productos al carrito
- [ ] Hacer click en "Finalizar Compra"
- [ ] Verificar que aparezca el mensaje de éxito
- [ ] Verificar que el carrito se vacíe
- [ ] Verificar que el badge desaparezca
- [ ] Verificar que el modal se cierre
- [ ] Verificar en la BD que se creó el pedido

### 7. Pruebas de Base de Datos

#### Verificar Carrito en BD
```sql
SELECT email, carrito FROM users WHERE email = 'tu-email@test.com';
```
Resultado esperado:
```
email              | carrito
-------------------+------------------
tu-email@test.com  | ["1","1","2","3"]
```

#### Verificar Pedido en BD
```sql
SELECT * FROM pedidos WHERE usuario = 'tu-email@test.com' ORDER BY fecha DESC LIMIT 1;
```
Resultado esperado:
```
id | usuario           | productos    | entregado | fecha
---+-------------------+--------------+-----------+---------------------
1  | tu-email@test.com | {1,1,2,3}    | false     | 2024-01-15 10:30:00
```

#### Verificar Productos del Pedido
```sql
SELECT 
  pr.id,
  pr.nombre,
  pr.precio,
  COUNT(*) as cantidad
FROM pedidos p
CROSS JOIN LATERAL unnest(p.productos) AS producto_id
JOIN productos pr ON pr.id = producto_id
WHERE p.usuario = 'tu-email@test.com'
  AND p.id = (SELECT MAX(id) FROM pedidos WHERE usuario = 'tu-email@test.com')
GROUP BY pr.id, pr.nombre, pr.precio;
```

### 8. Pruebas de Errores

#### Sin Sesión
- [ ] Cerrar sesión
- [ ] Hacer click en "Carrito"
- [ ] Verificar que se abra el modal de login

#### Carrito Vacío
- [ ] Iniciar sesión
- [ ] Vaciar el carrito
- [ ] Hacer click en "Carrito"
- [ ] Verificar que muestre "Tu carrito está vacío"
- [ ] Hacer click en "Finalizar Compra"
- [ ] Verificar que muestre error "El carrito está vacío"

#### Producto Inexistente
- [ ] Modificar manualmente el carrito en BD con un ID inexistente
- [ ] Abrir el carrito
- [ ] Verificar que no se rompa la aplicación

### 9. Pruebas de Persistencia

#### LocalStorage
- [ ] Añadir productos al carrito
- [ ] Recargar la página
- [ ] Verificar que el badge siga mostrando la cantidad correcta
- [ ] Abrir el carrito
- [ ] Verificar que los productos sigan ahí

#### Base de Datos
- [ ] Añadir productos al carrito
- [ ] Cerrar sesión
- [ ] Iniciar sesión de nuevo
- [ ] Verificar que el carrito siga con los productos

### 10. Pruebas de UI/UX

#### Responsive
- [ ] Probar en móvil
- [ ] Probar en tablet
- [ ] Probar en desktop
- [ ] Verificar que el modal se vea bien en todos los tamaños

#### Animaciones
- [ ] Verificar que el modal se abra suavemente
- [ ] Verificar que los botones tengan hover effect
- [ ] Verificar que el badge aparezca/desaparezca correctamente

#### Feedback
- [ ] Verificar mensajes de éxito
- [ ] Verificar mensajes de error
- [ ] Verificar que los botones se deshabiliten durante operaciones

## 🐛 Problemas Comunes y Soluciones

### El carrito no se carga
**Síntoma**: Al abrir el carrito, muestra "Error al cargar el carrito"

**Soluciones**:
1. Verificar que el usuario esté logueado
2. Abrir la consola del navegador y buscar errores
3. Verificar que la función `getCart` esté desplegada
4. Verificar la conexión a la base de datos

### Los productos no se muestran
**Síntoma**: El carrito se abre pero no muestra productos

**Soluciones**:
1. Verificar que los IDs en el carrito correspondan a productos existentes
2. Verificar que la tabla `productos` tenga los campos correctos
3. Revisar la consola para errores de SQL

### Error al finalizar compra
**Síntoma**: Al hacer click en "Finalizar Compra" aparece un error

**Soluciones**:
1. Verificar que la tabla `pedidos` exista
2. Verificar que el tipo de datos sea correcto (INTEGER[])
3. Revisar los logs de Netlify Functions
4. Verificar que el usuario tenga productos en el carrito

### El badge no se actualiza
**Síntoma**: El número en el badge no cambia

**Soluciones**:
1. Verificar que `updateCartBadge()` se llame después de cada operación
2. Verificar que `currentUser.carrito` se actualice correctamente
3. Limpiar localStorage y volver a iniciar sesión

### Productos duplicados incorrectamente
**Síntoma**: Se muestran productos duplicados en lugar de cantidades

**Soluciones**:
1. Verificar que la función `loadCart()` agrupe correctamente por ID
2. Verificar que el array `productCount` se calcule bien
3. Verificar que `uniqueProducts` filtre correctamente

## 📊 Métricas de Éxito

- ✅ Todas las operaciones completan en < 2 segundos
- ✅ No hay errores en la consola del navegador
- ✅ No hay errores en los logs de Netlify
- ✅ Los datos en BD son consistentes
- ✅ El UI responde correctamente en todos los dispositivos
- ✅ Los usuarios pueden completar una compra sin problemas

## 🔄 Flujo de Prueba Completo

1. **Inicio**: Usuario sin sesión
2. **Login**: Iniciar sesión con usuario de prueba
3. **Añadir**: Añadir 3 productos diferentes (2x Producto A, 1x Producto B, 3x Producto C)
4. **Verificar Badge**: Debe mostrar "6"
5. **Abrir Carrito**: Ver que se muestren los 3 productos con cantidades correctas
6. **Modificar**: Quitar 1x Producto A (debe quedar 1x)
7. **Verificar Badge**: Debe mostrar "5"
8. **Añadir**: Añadir 1x Producto A más (debe quedar 2x)
9. **Verificar Badge**: Debe mostrar "6"
10. **Finalizar**: Hacer click en "Finalizar Compra"
11. **Verificar**: Carrito vacío, badge oculto, mensaje de éxito
12. **BD**: Verificar que el pedido se creó correctamente con productos {1,1,2,3,3,3}
13. **Logout**: Cerrar sesión
14. **Login**: Iniciar sesión de nuevo
15. **Verificar**: Carrito debe estar vacío

## ✨ Resultado Esperado

Al completar todas las pruebas, deberías tener:
- ✅ Un sistema de carrito completamente funcional
- ✅ Productos que se pueden añadir/quitar dinámicamente
- ✅ Cantidades que se actualizan correctamente
- ✅ Pedidos que se guardan en la base de datos
- ✅ UI responsive y amigable
- ✅ Feedback claro para el usuario
