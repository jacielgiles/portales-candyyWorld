# 👀 CÓMO VER LOS CAMBIOS

## ✅ Cambios Aplicados

### 1. Notificación de Cookies
**Archivo creado**: `public/cookies.js`

Este archivo se carga automáticamente en:
- `public/index.html`
- `public/productos.html`
- `public/espec_producto.html`

### 2. Emojis Eliminados
- ❌ Quitado emoji de Favoritos
- ✅ Solo queda 🛒 Carrito

---

## 🚀 Para Ver los Cambios

### Paso 1: Desplegar
```bash
git add .
git commit -m "Feat: Notificación de cookies funcional"
git push
```

### Paso 2: Probar Localmente (Opcional)
Si tienes un servidor local:
```bash
# Abre index.html en tu navegador
# O usa un servidor local como:
npx serve public
```

### Paso 3: Ver la Notificación de Cookies

1. **Abre tu página** (index.html, productos.html, etc.)

2. **Si no aparece la notificación**, borra el localStorage:
   - Presiona `F12` para abrir DevTools
   - Ve a la pestaña `Application` (o `Aplicación`)
   - En el menú izquierdo, busca `Local Storage`
   - Haz clic derecho y selecciona `Clear`
   - O ejecuta en la consola: `localStorage.clear()`

3. **Recarga la página** (`F5` o `Ctrl+R`)

4. **Verás la notificación** en la parte inferior de la página:
   - Fondo blanco
   - Borde rosa en la parte superior
   - Título: "Uso de Cookies"
   - Dos botones: "Aceptar" (verde) y "Rechazar" (gris)

---

## 🎨 Cómo Se Ve

```
┌─────────────────────────────────────────────────────────┐
│ ═══════════════════════════════════════════════════════ │ ← Borde rosa
│                                                         │
│  Uso de Cookies                                         │
│  Utilizamos cookies para mejorar tu experiencia...     │
│                                                         │
│                          [Aceptar] [Rechazar]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Verificar que Funciona

### Después de hacer clic en "Aceptar":
1. La notificación desaparece
2. Se guarda en localStorage: `cookiesAccepted = "true"`
3. No volverá a aparecer en futuras visitas

### Después de hacer clic en "Rechazar":
1. La notificación desaparece
2. Se guarda en localStorage: `cookiesAccepted = "false"`
3. No volverá a aparecer en futuras visitas

### Para ver la notificación de nuevo:
```javascript
// En la consola del navegador (F12):
localStorage.removeItem('cookiesAccepted');
location.reload();
```

---

## 📁 Archivos Modificados

1. ✅ `public/cookies.js` - NUEVO (contiene toda la lógica)
2. ✅ `public/index.html` - Incluye cookies.js
3. ✅ `public/productos.html` - Incluye cookies.js
4. ✅ `public/espec_producto.html` - Incluye cookies.js
5. ✅ `public/shared-header.html` - Emoji de favoritos quitado

---

## 🐛 Solución de Problemas

### La notificación no aparece
1. Verifica que desplegaste los cambios
2. Borra el localStorage
3. Recarga con `Ctrl + F5` (limpia caché)
4. Verifica en la consola si hay errores

### El archivo cookies.js no se carga
1. Verifica que el archivo existe en `public/cookies.js`
2. Verifica que la ruta en el HTML es correcta: `<script src="cookies.js"></script>`
3. Abre DevTools > Network y busca `cookies.js`

### Los botones no funcionan
1. Abre la consola (F12)
2. Verifica si hay errores de JavaScript
3. Prueba ejecutar manualmente: `acceptCookies()` o `rejectCookies()`

---

## ✨ Características

- ✅ Diseño limpio y profesional
- ✅ Responsive (se adapta a móviles)
- ✅ Botones con hover effects
- ✅ Se guarda la preferencia del usuario
- ✅ No vuelve a aparecer después de aceptar/rechazar
- ✅ Fácil de personalizar (todo en un archivo)

---

## 🎉 ¡Listo!

Ahora tu página tiene una notificación de cookies profesional y funcional.
