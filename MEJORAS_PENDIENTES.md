# 🚀 MEJORAS PENDIENTES - Implementación

## ✅ 1. Notificación de Cookies - COMPLETADO
- Agregada notificación en shared-header.html
- Botones Aceptar/Rechazar
- Se guarda en localStorage

## ✅ 2. Quitar Emoji de Favoritos - COMPLETADO
- Solo queda el emoji de 🛒 Carrito
- Favoritos sin emoji

## 🔧 3. Editar Productos en Admin - EN PROCESO

### Agregar Tab "Editar Productos"
En `admin.html`, agregar después de la línea de tabs:

```html
<button class="tab-btn" onclick="switchTab('editar')">Editar Productos</button>
```

### Agregar contenido del tab
Después del tab de eliminar, agregar:

```html
<!-- Tab: Editar Producto -->
<div id="tab-editar" class="tab-content">
  <h2>Editar Producto</h2>
  <div style="margin-bottom:20px">
    <label style="display:block;margin-bottom:8px;font-weight:600">Selecciona un producto:</label>
    <select id="editProductSelect" onchange="loadProductToEdit()" style="width:100%;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
      <option value="">-- Selecciona un producto --</option>
    </select>
  </div>
  
  <form id="editProductForm" style="display:none">
    <input type="hidden" id="editProductId">
    
    <div class="field">
      <label>Categoría *</label>
      <input type="text" id="editCategoria" required>
    </div>
    
    <div class="field">
      <label>Nombre *</label>
      <input type="text" id="editNombre" required>
    </div>
    
    <div class="field">
      <label>Imagen (URL) *</label>
      <input type="url" id="editImagen" required>
    </div>
    
    <div class="field">
      <label>Descripción *</label>
      <textarea id="editDescripcion" rows="3" required></textarea>
    </div>
    
    <div class="row">
      <div class="field">
        <label>Stock *</label>
        <input type="number" id="editStock" required>
      </div>
      <div class="field">
        <label>Precio *</label>
        <input type="number" id="editPrecio" step="0.01" required>
      </div>
    </div>
    
    <div class="row">
      <div class="field">
        <label>País</label>
        <input type="text" id="editPais">
      </div>
      <div class="field">
        <label>Cantidad</label>
        <input type="text" id="editCantidad">
      </div>
    </div>
    
    <div class="field">
      <label>Sabor</label>
      <input type="text" id="editSabor">
    </div>
    
    <div class="field">
      <label>Marca *</label>
      <input type="text" id="editMarca" required>
    </div>
    
    <button type="submit" class="btn">Guardar Cambios</button>
  </form>
</div>
```

### Agregar funciones JavaScript
```javascript
// Cargar productos en el select de editar
async function loadProductsForEdit() {
  try {
    const res = await fetch('/.netlify/functions/getProductos', { method: 'POST' });
    const data = await res.json();
    
    if (data.success) {
      const select = document.getElementById('editProductSelect');
      select.innerHTML = '<option value="">-- Selecciona un producto --</option>';
      data.products.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = `${prod.nombre} (${prod.marca})`;
        select.appendChild(option);
      });
      window.allProductsForEdit = data.products;
    }
  } catch (err) {
    console.error(err);
  }
}

// Cargar datos del producto seleccionado
function loadProductToEdit() {
  const productId = document.getElementById('editProductSelect').value;
  if (!productId) {
    document.getElementById('editProductForm').style.display = 'none';
    return;
  }
  
  const product = window.allProductsForEdit.find(p => p.id == productId);
  if (!product) return;
  
  document.getElementById('editProductId').value = product.id;
  document.getElementById('editCategoria').value = product.categoria || '';
  document.getElementById('editNombre').value = product.nombre || '';
  document.getElementById('editImagen').value = product.imagen || '';
  document.getElementById('editDescripcion').value = product.descripcion || '';
  document.getElementById('editStock').value = product.stock || 0;
  document.getElementById('editPrecio').value = product.precio || 0;
  document.getElementById('editPais').value = product.pais || '';
  document.getElementById('editCantidad').value = product.cantidad || '';
  document.getElementById('editSabor').value = product.sabor || '';
  document.getElementById('editMarca').value = product.marca || '';
  
  document.getElementById('editProductForm').style.display = 'block';
}

// Guardar cambios del producto
document.getElementById('editProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const productId = document.getElementById('editProductId').value;
  const producto = {
    id: productId,
    categoria: document.getElementById('editCategoria').value.trim(),
    nombre: document.getElementById('editNombre').value.trim(),
    imagen: document.getElementById('editImagen').value.trim(),
    descripcion: document.getElementById('editDescripcion').value.trim(),
    stock: parseInt(document.getElementById('editStock').value),
    precio: parseFloat(document.getElementById('editPrecio').value),
    pais: document.getElementById('editPais').value.trim(),
    cantidad: document.getElementById('editCantidad').value.trim(),
    sabor: document.getElementById('editSabor').value.trim(),
    marca: document.getElementById('editMarca').value.trim()
  };
  
  try {
    const res = await fetch('/.netlify/functions/updateProducto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    });
    
    const data = await res.json();
    
    if (data.success) {
      showNotification('Producto actualizado correctamente', 'success');
      loadProductsForEdit(); // Recargar lista
    } else {
      showNotification('Error al actualizar producto', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error de conexión', 'error');
  }
});

// Llamar al cargar el tab de editar
function switchTab(tabName) {
  // ... código existente ...
  
  if (tabName === 'editar') {
    loadProductsForEdit();
  }
}
```

### Crear función de backend
Crear archivo: `netlify/functions/updateProducto.js`

```javascript
import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false }) };
  }

  const producto = JSON.parse(event.body);
  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();
    
    await client.query(
      `UPDATE productos SET 
        categoria = $1, 
        nombre = $2, 
        imagen = $3, 
        descripcion = $4, 
        stock = $5, 
        precio = $6, 
        pais = $7, 
        cantidad = $8, 
        sabor = $9, 
        marca = $10
      WHERE id = $11`,
      [
        producto.categoria,
        producto.nombre,
        producto.imagen,
        producto.descripcion,
        producto.stock,
        producto.precio,
        producto.pais,
        producto.cantidad,
        producto.sabor,
        producto.marca,
        producto.id
      ]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Producto actualizado" })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: err.message }) };
  } finally {
    await client.end();
  }
}
```

---

## 🔧 4. Filtro por País

### En productos.html
Agregar después del filtro de marca:

```html
<div class="filter-section">
  <h4>País</h4>
  <div id="filterPais"></div>
</div>
```

### En JavaScript de productos.html
Actualizar función `loadFilters()`:

```javascript
const paises = [...new Set(allProducts.map(p => p.pais).filter(p => p))];

const filterPais = document.getElementById('filterPais');
filterPais.innerHTML = paises.map(pais => `
  <label>
    <input type="checkbox" value="${pais}" onchange="applyFilters()">
    ${pais}
  </label>
`).join('');
```

Actualizar función `applyFilters()`:

```javascript
const selectedPaises = Array.from(document.querySelectorAll('#filterPais input:checked')).map(cb => cb.value);

// En el filtro:
const matchPais = selectedPaises.length === 0 || selectedPaises.includes(prod.pais);

return matchCategoria && matchSabor && matchMarca && matchPais && matchPrice;
```

---

## 🔧 5. Deslizadores de Países y Marcas en Index

### Agregar después de "Promociones" en index.html

```html
<!-- Deslizador de Países -->
<section style="margin:60px 0;overflow:hidden">
  <div style="max-width:1400px;margin:0 auto;padding:0 20px">
    <h2 style="text-align:center;color:#FF9EB4;margin-bottom:30px;font-size:32px">Explora por País</h2>
    <div class="slider-container">
      <div class="slider slider-left" id="paisesSlider">
        <!-- Se llena con JavaScript -->
      </div>
    </div>
  </div>
</section>

<!-- Deslizador de Marcas -->
<section style="margin:60px 0;overflow:hidden;background:#f9f9f9;padding:60px 0">
  <div style="max-width:1400px;margin:0 auto;padding:0 20px">
    <h2 style="text-align:center;color:#FF9EB4;margin-bottom:30px;font-size:32px">Explora por Marca</h2>
    <div class="slider-container">
      <div class="slider slider-right" id="marcasSlider">
        <!-- Se llena con JavaScript -->
      </div>
    </div>
  </div>
</section>
```

### CSS para los deslizadores

```css
.slider-container {
  overflow: hidden;
  position: relative;
}

.slider {
  display: flex;
  gap: 20px;
  animation-duration: 30s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.slider-left {
  animation-name: slideLeft;
}

.slider-right {
  animation-name: slideRight;
}

@keyframes slideLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes slideRight {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.slider-item {
  flex-shrink: 0;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  color: #FF9EB4;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 3px solid #FF9EB4;
}

.slider-item:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(255,156,179,0.3);
}
```

### JavaScript para cargar deslizadores

```javascript
async function loadSliders() {
  try {
    const res = await fetch('/.netlify/functions/getProductos', { method: 'POST' });
    const data = await res.json();
    
    if (data.success) {
      const paises = [...new Set(data.products.map(p => p.pais).filter(p => p))];
      const marcas = [...new Set(data.products.map(p => p.marca).filter(m => m))];
      
      // Duplicar para efecto infinito
      const paisesHTML = paises.concat(paises).map(pais => `
        <div class="slider-item" onclick="window.location.href='productos.html?pais=${encodeURIComponent(pais)}'">
          ${pais}
        </div>
      `).join('');
      
      const marcasHTML = marcas.concat(marcas).map(marca => `
        <div class="slider-item" onclick="window.location.href='productos.html?marca=${encodeURIComponent(marca)}'">
          ${marca}
        </div>
      `).join('');
      
      document.getElementById('paisesSlider').innerHTML = paisesHTML;
      document.getElementById('marcasSlider').innerHTML = marcasHTML;
    }
  } catch (err) {
    console.error(err);
  }
}

// Llamar al cargar la página
loadSliders();
```

---

## 🔧 6. Arreglar Modal de Login

El problema es que "¿No tienes cuenta? Crear cuenta" aparece fuera del modal.

### Solución
Verificar que el div `.switch` esté DENTRO del div `.modal` en shared-header.html

---

## 🔧 7. Limitar Productos Recomendados

En index.html, en la sección de productos recomendados:

```javascript
// Limitar a 8 productos
const productosRecomendados = data.products.slice(0, 8);

productsContainer.innerHTML = productosRecomendados.map(prod => {
  // ... código existente ...
}).join('');
```

---

## 📝 Resumen de Archivos a Modificar

1. ✅ `public/shared-header.html` - Cookies y quitar emoji favoritos
2. 🔧 `public/admin.html` - Tab de editar productos
3. 🔧 `netlify/functions/updateProducto.js` - CREAR NUEVO
4. 🔧 `public/productos.html` - Filtro de país
5. 🔧 `public/index.html` - Deslizadores y limitar recomendados
6. 🔧 `public/css/style.css` - Estilos de deslizadores

---

## 🚀 Orden de Implementación

1. ✅ Cookies - HECHO
2. ✅ Quitar emoji favoritos - HECHO
3. Editar productos en admin
4. Filtro por país
5. Deslizadores de países y marcas
6. Arreglar modal login
7. Limitar productos recomendados
