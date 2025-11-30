# 🎛️ SWITCHES PARA DATOS DE ENVÍO

## ✅ Implementación Completa

He agregado dos switches (toggles) en el modal "Datos de Entrega y Pago":

### 1. 📋 Usar datos guardados
- **Color**: Verde cuando está activado, gris cuando no
- **Función**: Carga automáticamente los datos de envío guardados previamente
- **Ubicación**: Parte superior del modal, antes del formulario

### 2. 💾 Guardar datos
- **Color**: Verde cuando está activado, gris cuando no
- **Función**: Guarda los datos de envío para futuras compras
- **Ubicación**: Parte superior del modal, debajo del switch de "Usar datos"

---

## 🎨 Diseño de los Switches

```
┌─────────────────────────────────────────────────┐
│  Datos de Entrega y Pago                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  📋 Usar datos guardados          [●─────]     │
│     Cargar mis datos de envío anteriores        │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  💾 Guardar datos                 [─────●]     │
│     Guardar para futuras compras                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Verde (activado)**: `[─────●]`  
**Gris (desactivado)**: `[●─────]`

---

## 🔧 Archivos Modificados

### 1. `public/shared-header.html`
- ✅ Agregados dos switches al inicio del modal de envío
- ✅ Eliminado el checkbox viejo de guardar datos

### 2. `public/cart.js`
- ✅ Función `toggleUsarDatosGuardados()` - Carga datos guardados
- ✅ Función `toggleGuardarDatosSwitch()` - Marca para guardar datos
- ✅ Función `cargarDatosGuardadosEnFormulario()` - Llena el formulario
- ✅ Función `limpiarFormularioEnvio()` - Limpia el formulario
- ✅ Función `verificarDatosGuardados()` - Verifica si hay datos guardados
- ✅ Actualizada función `procesarCompra()` - Usa el switch en lugar del checkbox

### 3. `public/css/style.css`
- ✅ Estilos completos para los switches
- ✅ Animaciones suaves
- ✅ Colores: Verde (#4CAF50) cuando activo, Gris (#ccc) cuando inactivo

---

## 🚀 Cómo Funciona

### Switch 1: Usar Datos Guardados

**Cuando se activa**:
1. Hace una petición a `/.netlify/functions/getDatosEnvio`
2. Si hay datos guardados, los carga en el formulario
3. Muestra notificación: "Datos cargados correctamente"
4. Si NO hay datos, muestra: "No hay datos guardados" y desactiva el switch

**Cuando se desactiva**:
1. Limpia todos los campos del formulario
2. Remueve las clases de "filled" de los campos

### Switch 2: Guardar Datos

**Cuando se activa**:
1. Marca una variable global: `window.guardarDatosEnvio = true`
2. Muestra notificación: "Los datos se guardarán al confirmar la compra"

**Cuando se desactiva**:
1. Marca: `window.guardarDatosEnvio = false`

**Al confirmar la compra**:
- Si el switch está activado, los datos se guardan en la tabla `datos_envio_guardados`
- La función `finalizarCompra.js` maneja el guardado automáticamente

---

## 📊 Flujo Completo

```
Usuario hace clic en "Finalizar Compra"
    ↓
Se abre modal "Datos de Entrega y Pago"
    ↓
Se verifica si hay datos guardados
    ↓
Si hay datos → Muestra badge "✓" en el switch
    ↓
Usuario puede:
    ├─ Activar "Usar datos guardados" → Carga datos
    └─ Activar "Guardar datos" → Marca para guardar
    ↓
Usuario llena/revisa el formulario
    ↓
Usuario hace clic en "Confirmar Compra"
    ↓
Si "Guardar datos" está activado:
    ├─ Guarda en datos_envio_guardados
    └─ Muestra en respuesta: datosGuardados: true
    ↓
Compra finalizada
```

---

## 🎮 Pruebas

### Prueba 1: Guardar Datos por Primera Vez
1. Agrega productos al carrito
2. Haz clic en "Finalizar Compra"
3. Llena el formulario de envío
4. **Activa el switch "Guardar datos"** (debe ponerse verde)
5. Confirma la compra
6. Verifica en la base de datos:
   ```sql
   SELECT * FROM datos_envio_guardados WHERE usuario = 'tu_email@ejemplo.com';
   ```

### Prueba 2: Usar Datos Guardados
1. Agrega productos al carrito
2. Haz clic en "Finalizar Compra"
3. Verás un badge "✓" verde en el switch "Usar datos guardados"
4. **Activa el switch "Usar datos guardados"** (debe ponerse verde)
5. Los campos se llenan automáticamente
6. Verifica que todos los datos son correctos

### Prueba 3: Limpiar Datos
1. Con datos cargados en el formulario
2. **Desactiva el switch "Usar datos guardados"** (debe ponerse gris)
3. Todos los campos se limpian automáticamente

### Prueba 4: Actualizar Datos Guardados
1. Carga datos guardados (switch activado)
2. Modifica algunos campos
3. **Activa el switch "Guardar datos"**
4. Confirma la compra
5. Los datos se actualizan en la base de datos

---

## 🎨 Estilos CSS

Los switches tienen:
- **Ancho**: 60px
- **Alto**: 30px
- **Color activo**: Verde (#4CAF50)
- **Color inactivo**: Gris (#ccc)
- **Animación**: Transición suave de 0.3s
- **Sombra**: Box-shadow en el círculo blanco

---

## 🔍 Verificación en Base de Datos

### Ver datos guardados de un usuario:
```sql
SELECT * FROM datos_envio_guardados 
WHERE usuario = 'tu_email@ejemplo.com';
```

### Ver todos los datos guardados:
```sql
SELECT usuario, nombre_completo, ciudad, estado, metodo_pago_preferido, updated_at
FROM datos_envio_guardados
ORDER BY updated_at DESC;
```

### Eliminar datos guardados de un usuario (si es necesario):
```sql
DELETE FROM datos_envio_guardados 
WHERE usuario = 'tu_email@ejemplo.com';
```

---

## 🆘 Solución de Problemas

### Los switches no aparecen
→ Verifica que desplegaste los cambios: `git push`
→ Recarga con Ctrl + F5

### El switch no se pone verde
→ Verifica que los estilos CSS se cargaron correctamente
→ Inspecciona el elemento en el navegador

### Los datos no se cargan
→ Verifica que la tabla `datos_envio_guardados` existe
→ Verifica que hay datos guardados para ese usuario
→ Revisa la consola del navegador para errores

### Los datos no se guardan
→ Verifica que el switch está activado (verde)
→ Verifica que la función `finalizarCompra.js` está actualizada
→ Revisa los logs de Netlify

---

## 📦 Archivos SQL Necesarios

Asegúrate de que estas tablas existen:

1. **datos_envio_guardados** (para guardar datos del usuario)
   ```sql
   -- Ejecuta: crear_tabla_datos_guardados.sql
   ```

2. **datos_envio** (para cada pedido)
   ```sql
   -- Ejecuta: crear_tabla_datos_envio.sql
   ```

---

## 🎉 Resultado Final

Ahora tu modal de "Datos de Entrega y Pago" tiene:

✅ Switches elegantes con colores verde/gris
✅ Opción para cargar datos guardados
✅ Opción para guardar datos nuevos
✅ Animaciones suaves
✅ Notificaciones informativas
✅ Badge "✓" cuando hay datos disponibles
✅ Limpieza automática del formulario
✅ Integración completa con el backend

**Experiencia de usuario mejorada al 100%** 🚀
