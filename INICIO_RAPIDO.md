# 🚀 Inicio Rápido - Sistema de Carrito

## ⚡ 3 Pasos para Activar

### 1️⃣ Crear Tabla en Base de Datos (2 minutos)

Abre tu consola SQL de Neon y ejecuta:

```sql
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario TEXT NOT NULL,
    productos INTEGER[] NOT NULL,
    entregado BOOLEAN DEFAULT false,
    fecha TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha DESC);
```

### 2️⃣ Desplegar Funciones (1 minuto)

```bash
# Opción A: Con Netlify CLI
netlify deploy --prod

# Opción B: Con Git (si tienes CI/CD)
git add .
git commit -m "Sistema de carrito completo"
git push origin main
```

### 3️⃣ Probar (2 minutos)

1. Abre tu sitio web
2. Inicia sesión
3. Añade productos al carrito
4. Abre el carrito (botón en header)
5. Modifica cantidades con + y -
6. Click en "Finalizar Compra"
7. ¡Listo! 🎉

## ✅ Verificar que Funciona

### En el Navegador
```
1. Badge del carrito muestra número de items ✓
2. Modal del carrito se abre correctamente ✓
3. Productos se muestran con imágenes y precios ✓
4. Botones + y - funcionan ✓
5. Total se calcula correctamente ✓
6. "Finalizar Compra" muestra mensaje de éxito ✓
7. Carrito se vacía después de comprar ✓
```

### En la Base de Datos
```sql
-- Ver el último pedido
SELECT * FROM pedidos ORDER BY fecha DESC LIMIT 1;
```

Deberías ver algo como:
```
id | usuario           | productos    | entregado | fecha
---+-------------------+--------------+-----------+---------------------
1  | user@email.com    | {1,2,3,3,3}  | false     | 2024-01-15 10:30:00
```

## 🎯 Funcionalidades Disponibles

### ➕ Añadir Productos
- Click en "Añadir al Carrito" en cualquier producto
- El badge se actualiza automáticamente

### 👀 Ver Carrito
- Click en botón "Carrito" en el header
- Se abre modal con todos los productos

### ✏️ Modificar Cantidades
- Botón `+` añade una unidad
- Botón `-` elimina una unidad
- Si llega a 0, el producto desaparece

### 💳 Finalizar Compra
- Click en "Finalizar Compra"
- Se crea el pedido en la BD
- El carrito se vacía
- Mensaje de confirmación

## 📱 Funciona En

✅ Chrome / Edge / Firefox / Safari
✅ Móvil / Tablet / Desktop
✅ iOS / Android / Windows / Mac

## 🆘 Si Algo No Funciona

### El carrito no se abre
```javascript
// Abre la consola del navegador (F12)
// Busca errores en rojo
// Si ves "cart.js not found", verifica que el archivo exista en public/
```

### Los productos no se muestran
```sql
-- Verifica que tengas productos en la BD
SELECT * FROM productos LIMIT 5;
```

### Error al finalizar compra
```sql
-- Verifica que la tabla pedidos exista
SELECT * FROM pedidos LIMIT 1;
```

### Más ayuda
Lee `TEST_CARRITO.md` para soluciones detalladas.

## 📚 Documentación Completa

- `RESUMEN_CAMBIOS.md` - Qué se hizo y por qué
- `CARRITO_README.md` - Instrucciones detalladas
- `FLUJO_CARRITO.md` - Cómo funciona internamente
- `TEST_CARRITO.md` - Cómo probar todo

## 🎉 ¡Eso es Todo!

Tu sistema de carrito está listo. Solo necesitas:
1. ✅ Crear la tabla `pedidos`
2. ✅ Desplegar las funciones
3. ✅ Probar

**Tiempo total: ~5 minutos** ⏱️

---

**¿Dudas?** Revisa los archivos de documentación o abre la consola del navegador para ver errores específicos.
