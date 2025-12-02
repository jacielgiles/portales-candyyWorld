// ============================================
// FUNCIONES PARA EDITAR PRODUCTOS
// ============================================

// Cargar productos en el select de editar
async function loadProductsForEdit() {
  try {
    const res = await fetch('/.netlify/functions/getProductos', { method: 'POST' });
    const data = await res.json();
    
    if (data.success) {
      const select = document.getElementById('editProductSelect');
      if (!select) return;
      
      select.innerHTML = '<option value="">-- Selecciona un producto --</option>';
      data.products.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = `${prod.nombre} (${prod.marca || 'Sin marca'})`;
        select.appendChild(option);
      });
      window.allProductsForEdit = data.products;
    }
  } catch (err) {
    console.error(err);
    if (typeof showNotification === 'function') {
      showNotification('Error al cargar productos', 'error');
    }
  }
}

// Cargar datos del producto seleccionado
function loadProductToEdit() {
  const productId = document.getElementById('editProductSelect').value;
  const form = document.getElementById('editProductForm');
  
  if (!productId || !form) {
    if (form) form.style.display = 'none';
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
  
  form.style.display = 'block';
}

// Inicializar el formulario de edición
document.addEventListener('DOMContentLoaded', function() {
  const editForm = document.getElementById('editProductForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
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
          if (typeof showNotification === 'function') {
            showNotification('Producto actualizado correctamente', 'success');
          }
          loadProductsForEdit(); // Recargar lista
          editForm.reset();
          editForm.style.display = 'none';
          document.getElementById('editProductSelect').value = '';
        } else {
          if (typeof showNotification === 'function') {
            showNotification(data.message || 'Error al actualizar producto', 'error');
          }
        }
      } catch (err) {
        console.error(err);
        if (typeof showNotification === 'function') {
          showNotification('Error de conexión', 'error');
        }
      }
    });
  }
});

// Modificar la función switchTab para cargar productos al abrir el tab de editar
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabName) {
  if (typeof originalSwitchTab === 'function') {
    originalSwitchTab(tabName);
  }
  
  if (tabName === 'editar') {
    loadProductsForEdit();
  }
};
