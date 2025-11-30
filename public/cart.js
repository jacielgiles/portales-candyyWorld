// Sistema de notificaciones mejorado
function showNotification(message, type = 'success') {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  // Auto-ocultar después de 3 segundos
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Actualizar badge del carrito globalmente
function updateCartBadgeGlobal() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const cartBadge = document.getElementById('cartBadge');
  
  if (!cartBadge) return;
  
  if (!currentUser || !currentUser.carrito) {
    cartBadge.classList.add('hidden');
    return;
  }
  
  let cart = [];
  try { cart = JSON.parse(currentUser.carrito || "[]"); } catch {}
  
  if (cart.length > 0) {
    cartBadge.textContent = cart.length;
    cartBadge.classList.remove('hidden');
  } else {
    cartBadge.classList.add('hidden');
  }
}

// Funciones del carrito

async function loadCart(){
  if(!currentUser){
    cartItems.innerHTML = '<div class="empty-cart">Inicia sesión para ver tu carrito</div>';
    cartTotal.classList.add('hidden');
    return;
  }

  try {
    const res = await fetch('/.netlify/functions/getCart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email })
    });

    const data = await res.json();

    if (!data.success) {
      cartItems.innerHTML = '<div class="empty-cart">Error al cargar el carrito</div>';
      cartTotal.classList.add('hidden');
      return;
    }

    if (!data.products || data.products.length === 0) {
      cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
      cartTotal.classList.add('hidden');
      return;
    }

    // Agrupar productos por ID para mostrar cantidad
    const productCount = {};
    let cart = [];
    try { cart = JSON.parse(currentUser.carrito || "[]"); } catch {}
    
    cart.forEach(id => {
      productCount[id] = (productCount[id] || 0) + 1;
    });

    let total = 0;
    const uniqueProducts = data.products.filter((prod, index, self) => 
      index === self.findIndex(p => p.id === prod.id)
    );

    cartItems.innerHTML = uniqueProducts.map(prod => {
      const cantidad = productCount[prod.id] || 0;
      const subtotal = parseFloat(prod.precio) * cantidad;
      total += subtotal;

      return `
        <div class="cart-item">
          <img src="${prod.imagen}" alt="${prod.nombre}">
          <div class="cart-item-info">
            <h4>${prod.nombre}</h4>
            <p>$${parseFloat(prod.precio).toFixed(2)} x ${cantidad}</p>
            <p style="font-weight:bold">Subtotal: $${subtotal.toFixed(2)}</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn" style="padding:4px 8px;font-size:12px" onclick="addOneToCart(${prod.id})">+</button>
            <button class="btn cancel" style="padding:4px 8px;font-size:12px" onclick="removeOneFromCart(${prod.id})">-</button>
          </div>
        </div>
      `;
    }).join('');

    cartTotal.innerHTML = `Total: $${total.toFixed(2)}`;
    cartTotal.classList.remove('hidden');

    // Actualizar badge
    updateCartBadge();

  } catch (err) {
    console.error(err);
    cartItems.innerHTML = '<div class="empty-cart">Error de conexión</div>';
    cartTotal.classList.add('hidden');
  }
}

async function removeOneFromCart(productId){
  if(!currentUser) return;
  
  try {
    const res = await fetch('/.netlify/functions/removeFromCart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, productId: productId })
    });

    const data = await res.json();

    if (data.success) {
      currentUser.carrito = JSON.stringify(data.carrito);
      localStorage.setItem('user', JSON.stringify(currentUser));
      if (typeof updateCartBadge === 'function') updateCartBadge();
      updateCartBadgeGlobal();
      loadCart();
      showNotification('Producto eliminado del carrito', 'success');
    } else {
      showNotification('Error al eliminar producto', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error de conexión', 'error');
  }
}

async function addOneToCart(productId){
  if(!currentUser) return;
  
  try {
    const res = await fetch('/.netlify/functions/addToCart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, productId: String(productId) })
    });

    const data = await res.json();

    if (data.success) {
      currentUser.carrito = JSON.stringify(data.carrito);
      localStorage.setItem('user', JSON.stringify(currentUser));
      if (typeof updateCartBadge === 'function') updateCartBadge();
      updateCartBadgeGlobal();
      loadCart();
      showNotification('Producto añadido al carrito', 'success');
    } else {
      showNotification('Error al añadir producto', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error de conexión', 'error');
  }
}

// Calcular descuento por puntos
function calcularDescuento(puntos) {
  // Fórmula: 1% de descuento por cada 100 puntos
  // Máximo 20% de descuento
  let descuento = Math.floor(puntos / 100);
  if (descuento > 20) descuento = 20;
  return descuento;
}

// Calcular puntos que se ganarán con esta compra
function calcularPuntosGanados(total, cantidad) {
  let puntos = Math.floor(20 + (total * 0.5) + (cantidad * 10));
  if (puntos > 500) puntos = 500;
  if (puntos < 20) puntos = 20;
  return puntos;
}

// Finalizar compra - Mostrar formulario de envío con puntos y descuentos
async function finalizarCompra(){
  if(!currentUser) return;
  
  // Calcular total del carrito
  let cart = [];
  try { cart = JSON.parse(currentUser.carrito || "[]"); } catch {}
  
  if (cart.length === 0) {
    showNotification('Tu carrito está vacío', 'error');
    return;
  }
  
  // Obtener productos del carrito
  try {
    const res = await fetch('/.netlify/functions/getCart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email })
    });

    const data = await res.json();
    
    if (!data.success || !data.products || data.products.length === 0) {
      showNotification('Error al cargar el carrito', 'error');
      return;
    }
    
    // Verificar stock disponible
    const productCount = {};
    cart.forEach(id => {
      productCount[id] = (productCount[id] || 0) + 1;
    });
    
    let stockInsuficiente = false;
    let productosProblema = [];
    
    data.products.forEach(prod => {
      const cantidadSolicitada = productCount[prod.id] || 0;
      if (cantidadSolicitada > prod.stock) {
        stockInsuficiente = true;
        productosProblema.push(`${prod.nombre} (disponible: ${prod.stock}, solicitado: ${cantidadSolicitada})`);
      }
    });
    
    if (stockInsuficiente) {
      showNotification(`Stock insuficiente para: ${productosProblema.join(', ')}`, 'error');
      return;
    }
    
    let total = 0;
    const uniqueProducts = data.products.filter((prod, index, self) => 
      index === self.findIndex(p => p.id === prod.id)
    );
    
    uniqueProducts.forEach(prod => {
      const cantidad = productCount[prod.id] || 0;
      total += parseFloat(prod.precio) * cantidad;
    });
    
    // Calcular descuento por puntos actuales
    const puntosActuales = currentUser.puntos || 0;
    const descuentoPorcentaje = calcularDescuento(puntosActuales);
    const descuentoMonto = (total * descuentoPorcentaje) / 100;
    const totalConDescuento = total - descuentoMonto;
    
    // Calcular puntos que ganará
    const puntosGanados = calcularPuntosGanados(totalConDescuento, cart.length);
    
    // Actualizar el modal de envío con información de puntos
    const envioModal = document.getElementById('envioModal');
    const modalContent = envioModal.querySelector('.modal');
    
    // Buscar o crear sección de resumen
    let resumenSection = modalContent.querySelector('#resumenCompra');
    if (!resumenSection) {
      resumenSection = document.createElement('div');
      resumenSection.id = 'resumenCompra';
      resumenSection.style.cssText = 'background:#FFF5F8;padding:16px;border-radius:8px;margin-bottom:20px;border:2px solid #FF9EB4';
      
      const form = modalContent.querySelector('form');
      form.parentNode.insertBefore(resumenSection, form);
    }
    
    resumenSection.innerHTML = `
      <h4 style="margin:0 0 12px 0;color:#FF9EB4;font-size:18px">📊 Resumen de Compra</h4>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span>Subtotal:</span>
        <strong>$${total.toFixed(2)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#4CAF50">
        <span>🎁 Tus puntos actuales:</span>
        <strong>${puntosActuales} pts</strong>
      </div>
      ${descuentoPorcentaje > 0 ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#FF9EB4">
          <span>💰 Descuento (${descuentoPorcentaje}%):</span>
          <strong>-$${descuentoMonto.toFixed(2)}</strong>
        </div>
      ` : ''}
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-top:8px;border-top:2px solid #FF9EB4;font-size:18px">
        <span>Total a pagar:</span>
        <strong style="color:#FF9EB4">$${totalConDescuento.toFixed(2)}</strong>
      </div>
      <div style="background:#E8F5E9;padding:12px;border-radius:6px;text-align:center">
        <span style="color:#2E7D32;font-weight:600">⭐ Ganarás ${puntosGanados} puntos con esta compra</span>
        <br>
        <small style="color:#666">Acumula puntos para obtener descuentos en futuras compras</small>
      </div>
    `;
    
  } catch (err) {
    console.error(err);
    showNotification('Error al calcular el total', 'error');
    return;
  }
  
  // Verificar si hay datos guardados
  await verificarDatosGuardados();
  
  // Mostrar modal de datos de envío
  document.getElementById('cartModal').style.display = 'none';
  document.getElementById('envioModal').style.display = 'flex';
}

// Ver pedidos del usuario
async function verPedidos(){
  if(!currentUser) return;
  
  const pedidos = await loadPedidos();
  
  const pedidosHTML = pedidos.length === 0 ? 
    '<div class="empty-cart">No tienes pedidos</div>' :
    pedidos.map(p => {
      const estado = p.entregado ? 
        '<span style="background:#D4EDDA;color:#155724;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">✓ Entregado</span>' : 
        '<span style="background:#FFF3CD;color:#856404;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600">⏱ Pendiente</span>';
      
      const fecha = new Date(p.fecha).toLocaleDateString('es-MX');
      const numProductos = p.productos.length;
      
      return `
        <div class="cart-item">
          <div class="cart-item-info" style="flex:1">
            <h4>Pedido #${p.id}</h4>
            <p>${fecha} - ${numProductos} producto(s)</p>
            ${p.direccion ? `<p style="font-size:11px">${p.direccion}, ${p.ciudad}</p>` : ''}
          </div>
          <div>${estado}</div>
        </div>
      `;
    }).join('');
  
  document.getElementById('cartItems').innerHTML = pedidosHTML;
  document.getElementById('cartTotal').classList.add('hidden');
  document.getElementById('checkoutBtn').style.display = 'none';
  document.getElementById('verPedidosBtn').style.display = 'none';
  document.getElementById('volverCarritoBtn').style.display = 'block';
}

// Volver a ver el carrito
function volverCarrito(){
  loadCart();
  document.getElementById('checkoutBtn').style.display = 'block';
  document.getElementById('verPedidosBtn').style.display = 'block';
  document.getElementById('volverCarritoBtn').style.display = 'none';
}

// Procesar compra con datos de envío
async function procesarCompra(){
  // Verificar si el usuario quiere usar puntos
  const usarPuntosCheckbox = document.getElementById('usarPuntosCheckbox');
  const usarPuntos = usarPuntosCheckbox && usarPuntosCheckbox.checked;
  
  // Verificar si el usuario quiere guardar datos (desde el switch)
  const guardarDatosSwitch = document.getElementById('guardarDatosSwitch');
  const guardarDatos = guardarDatosSwitch && guardarDatosSwitch.checked;
  
  const datosEnvio = {
    nombreCompleto: document.getElementById('envioNombre').value.trim(),
    telefono: document.getElementById('envioTelefono').value.trim(),
    direccion: document.getElementById('envioDireccion').value.trim(),
    ciudad: document.getElementById('envioCiudad').value.trim(),
    estado: document.getElementById('envioEstado').value.trim(),
    codigoPostal: document.getElementById('envioCP').value.trim(),
    referencias: document.getElementById('envioReferencias').value.trim(),
    metodoPago: document.getElementById('metodoPago').value,
    usarPuntos: usarPuntos,
    guardarDatos: guardarDatos
  };
  
  // Validar campos obligatorios
  if (!datosEnvio.nombreCompleto || !datosEnvio.telefono || !datosEnvio.direccion || 
      !datosEnvio.ciudad || !datosEnvio.estado || !datosEnvio.codigoPostal || !datosEnvio.metodoPago) {
    showNotification('Por favor completa todos los campos obligatorios', 'error');
    return;
  }
  
  // Si es tarjeta, obtener datos de tarjeta
  if (datosEnvio.metodoPago === 'tarjeta') {
    datosEnvio.nombreTarjeta = document.getElementById('nombreTarjeta').value.trim();
    datosEnvio.numeroTarjeta = document.getElementById('numeroTarjeta').value.trim();
    datosEnvio.fechaExpiracion = document.getElementById('fechaExpiracion').value.trim();
    datosEnvio.cvv = document.getElementById('cvv').value.trim();
    
    if (!datosEnvio.nombreTarjeta || !datosEnvio.numeroTarjeta || !datosEnvio.fechaExpiracion || !datosEnvio.cvv) {
      showNotification('Por favor completa los datos de la tarjeta', 'error');
      return;
    }
  }
  
  try {
    const res = await fetch('/.netlify/functions/finalizarCompra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, datosEnvio })
    });

    const data = await res.json();

    if (data.success) {
      // Calcular mensaje de puntos
      let puntosMsg = '';
      if (data.puntosUsados > 0) {
        puntosMsg = ` Usaste ${data.puntosUsados} puntos (${data.descuentoAplicado}% descuento).`;
      }
      if (data.puntosGanados > 0) {
        puntosMsg += ` ¡Ganaste ${data.puntosGanados} puntos!`;
      }
      
      showNotification(`¡Compra finalizada correctamente!${puntosMsg}`, 'success');
      
      // Actualizar usuario con los puntos finales del servidor
      currentUser.carrito = JSON.stringify([]);
      currentUser.pedidos = String((parseInt(currentUser.pedidos) || 0) + 1);
      currentUser.puntos = data.puntosFinales || 0;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      // Actualizar UI de puntos si existe
      const userPuntos = document.getElementById('userPuntos');
      if (userPuntos) {
        userPuntos.textContent = currentUser.puntos;
        const descuento = Math.floor(currentUser.puntos / 100);
        const descuentoMax = descuento > 20 ? 20 : descuento;
        const userDescuento = document.getElementById('userDescuento');
        if (userDescuento) {
          userDescuento.textContent = descuentoMax + '%';
        }
      }
      
      if (typeof updateCartBadge === 'function') updateCartBadge();
      updateCartBadgeGlobal();
      loadCart();
      
      // Cerrar modales
      document.getElementById('envioModal').style.display = 'none';
      document.getElementById('cartModal').style.display = 'none';
      
      // Limpiar formulario
      document.getElementById('envioForm').reset();
    } else {
      showNotification(data.message || 'Error al finalizar la compra', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error de conexión', 'error');
  }
}


// Funciones de Favoritos

async function loadFavoritos(){
  if(!currentUser){
    document.getElementById('favoritosItems').innerHTML = '<div class="empty-cart">Inicia sesión para ver tus favoritos</div>';
    return;
  }

  try {
    const res = await fetch('/.netlify/functions/getFavoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email })
    });

    const data = await res.json();

    if (!data.success) {
      document.getElementById('favoritosItems').innerHTML = '<div class="empty-cart">Error al cargar favoritos</div>';
      return;
    }

    if (!data.products || data.products.length === 0) {
      document.getElementById('favoritosItems').innerHTML = '<div class="empty-cart">No tienes favoritos</div>';
      return;
    }

    document.getElementById('favoritosItems').innerHTML = data.products.map(prod => `
      <div class="cart-item">
        <img src="${prod.imagen}" alt="${prod.nombre}">
        <div class="cart-item-info">
          <h4>${prod.nombre}</h4>
          <p>$${parseFloat(prod.precio).toFixed(2)}</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn" style="padding:4px 8px;font-size:12px" onclick="addFavoritoToCart(${prod.id})">🛒</button>
          <button class="btn cancel" style="padding:4px 8px;font-size:12px" onclick="removeFromFavoritos(${prod.id})">✕</button>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error(err);
    document.getElementById('favoritosItems').innerHTML = '<div class="empty-cart">Error de conexión</div>';
  }
}

async function removeFromFavoritos(productId){
  if(!currentUser) return;
  
  try {
    const res = await fetch('/.netlify/functions/removeFromFavoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, productId: productId })
    });

    const data = await res.json();

    if (data.success) {
      currentUser.favoritos = JSON.stringify(data.favoritos);
      localStorage.setItem('user', JSON.stringify(currentUser));
      loadFavoritos();
      showNotification('Eliminado de favoritos', 'success');
    } else {
      showNotification('Error al eliminar de favoritos', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error de conexión', 'error');
  }
}

async function addFavoritoToCart(productId){
  if(!currentUser) return;
  
  try {
    const res = await fetch('/.netlify/functions/addToCart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, productId: String(productId) })
    });

    const data = await res.json();

    if (data.success) {
      currentUser.carrito = JSON.stringify(data.carrito);
      localStorage.setItem('user', JSON.stringify(currentUser));
      if (typeof updateCartBadge === 'function') updateCartBadge();
      updateCartBadgeGlobal();
      showNotification('Añadido al carrito', 'success');
    } else {
      showNotification('Error al añadir al carrito', 'error');
    }
  } catch (err) {
    console.error(err);
    showNotification('Error de conexión', 'error');
  }
}

// Mostrar/ocultar campos de tarjeta
function toggleTarjetaFields() {
  const metodoPago = document.getElementById('metodoPago').value;
  const tarjetaFields = document.getElementById('tarjetaFields');
  if (metodoPago === 'tarjeta') {
    tarjetaFields.style.display = 'block';
  } else {
    tarjetaFields.style.display = 'none';
  }
}


// Función para cargar pedidos del usuario
async function loadPedidos() {
  if (!currentUser) return;
  
  try {
    const res = await fetch('/.netlify/functions/getPedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email })
    });

    const data = await res.json();

    if (data.success && data.pedidos.length > 0) {
      return data.pedidos;
    }
    return [];

  } catch (err) {
    console.error(err);
    return [];
  }
}

// Función para mostrar pedidos en el perfil
async function mostrarPedidosEnPerfil() {
  const pedidos = await loadPedidos();
  
  const pedidosList = document.getElementById('pedidosList');
  if (!pedidosList) return;
  
  if (pedidos.length === 0) {
    pedidosList.innerHTML = '<div style="text-align:center;padding:40px;color:#999">No tienes pedidos aún</div>';
    return;
  }
  
  const pedidosHTML = pedidos.map(p => {
    const estado = p.entregado ? 
      '<span style="background:#D4EDDA;color:#155724;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600">✓ Entregado</span>' : 
      '<span style="background:#FFF3CD;color:#856404;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:600">⏱ Pendiente</span>';
    
    const fecha = new Date(p.fecha).toLocaleDateString('es-MX');
    const numProductos = p.productos.length;
    
    return `
      <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:12px;border-left:4px solid ${p.entregado ? '#4CAF50' : '#FFA726'}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div>
            <strong style="font-size:16px;color:#333">Pedido #${p.id}</strong>
            <br>
            <small style="color:#666">${fecha}</small>
          </div>
          <div>${estado}</div>
        </div>
        <div style="color:#666;font-size:14px">
          📦 ${numProductos} producto(s)
          ${p.direccion ? `<br>📍 ${p.ciudad}, ${p.estado}` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  pedidosList.innerHTML = pedidosHTML;
}


// Cargar datos de envío guardados del usuario
async function cargarDatosEnvioGuardados() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  if (!currentUser) {
    console.log('No hay usuario logueado');
    return;
  }
  
  console.log('Verificando datos guardados para:', currentUser.email);
  
  try {
    const res = await fetch('/.netlify/functions/getDatosEnvio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email })
    });

    const data = await res.json();
    console.log('Respuesta getDatosEnvio:', data);
    
    if (data.success && data.datos) {
      console.log('Datos guardados encontrados, mostrando botón');
      // Mostrar botón para usar datos guardados
      const botonDatosGuardados = document.getElementById('botonDatosGuardados');
      if (botonDatosGuardados) {
        botonDatosGuardados.style.display = 'block';
        console.log('Botón mostrado');
      } else {
        console.error('Elemento botonDatosGuardados no encontrado');
      }
    } else {
      console.log('No hay datos guardados para este usuario');
    }
  } catch (err) {
    console.error('Error al verificar datos guardados:', err);
  }
}

// Cargar datos guardados manualmente (cuando el usuario hace clic en el botón)
async function cargarDatosGuardadosManual() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  if (!currentUser) return;
  
  try {
    const res = await fetch('/.netlify/functions/getDatosEnvio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email })
    });

    const data = await res.json();
    
    if (data.success && data.datos) {
      const datos = data.datos;
      
      // Rellenar formulario con datos guardados
      if (datos.nombre_completo) document.getElementById('envioNombre').value = datos.nombre_completo;
      if (datos.telefono) document.getElementById('envioTelefono').value = datos.telefono;
      if (datos.direccion) document.getElementById('envioDireccion').value = datos.direccion;
      if (datos.ciudad) document.getElementById('envioCiudad').value = datos.ciudad;
      if (datos.estado) document.getElementById('envioEstado').value = datos.estado;
      if (datos.codigo_postal) document.getElementById('envioCP').value = datos.codigo_postal;
      if (datos.referencias) document.getElementById('envioReferencias').value = datos.referencias;
      if (datos.metodo_pago_preferido) {
        document.getElementById('metodoPago').value = datos.metodo_pago_preferido;
        if (typeof toggleTarjetaFields === 'function') toggleTarjetaFields();
      }
      
      // Ocultar botón y mostrar mensaje
      const botonDatosGuardados = document.getElementById('botonDatosGuardados');
      if (botonDatosGuardados) botonDatosGuardados.style.display = 'none';
      
      const mensajeDatosGuardados = document.getElementById('mensajeDatosGuardados');
      if (mensajeDatosGuardados) mensajeDatosGuardados.style.display = 'block';
      
      showNotification('Datos cargados correctamente', 'success');
    } else {
      showNotification('No hay datos guardados', 'info');
    }
  } catch (err) {
    console.error('Error al cargar datos guardados:', err);
    showNotification('Error al cargar datos', 'error');
  }
}


// ============================================
// FUNCIONES PARA USAR PUNTOS Y GUARDAR DATOS
// ============================================

// Función para toggle usar puntos
function toggleUsarPuntos() {
  const checkbox = document.getElementById('usarPuntosCheckbox');
  const descuentoDiv = document.getElementById('descuentoAplicado');
  const totalFinal = document.getElementById('totalFinal');
  const puntosGanadosDisplay = document.getElementById('puntosGanadosDisplay');
  
  if (!window.compraData) return;
  
  if (checkbox && checkbox.checked) {
    // Aplicar descuento
    descuentoDiv.style.display = 'block';
    totalFinal.textContent = window.compraData.totalConDescuento.toFixed(2);
    puntosGanadosDisplay.textContent = window.compraData.puntosGanados;
    showNotification(`Descuento de ${window.compraData.descuentoMonto.toFixed(2)} aplicado`, 'success');
  } else {
    // Quitar descuento
    descuentoDiv.style.display = 'none';
    totalFinal.textContent = window.compraData.total.toFixed(2);
    puntosGanadosDisplay.textContent = window.compraData.puntosGanadosSinDescuento;
  }
}

// Función para toggle guardar datos
function toggleGuardarDatos() {
  const checkbox = document.getElementById('guardarDatosCheckbox');
  if (checkbox) {
    window.guardarDatosEnvio = checkbox.checked;
  }
}


// ============================================
// FUNCIONES PARA SWITCHES DE DATOS DE ENVÍO
// ============================================

// Toggle para usar datos guardados
async function toggleUsarDatosGuardados() {
  const switchElement = document.getElementById('usarDatosGuardadosSwitch');
  
  if (switchElement && switchElement.checked) {
    // Cargar datos guardados
    await cargarDatosGuardadosEnFormulario();
  } else {
    // Limpiar formulario
    limpiarFormularioEnvio();
  }
}

// Toggle para guardar datos
function toggleGuardarDatosSwitch() {
  const switchElement = document.getElementById('guardarDatosSwitch');
  if (switchElement) {
    window.guardarDatosEnvio = switchElement.checked;
    if (switchElement.checked) {
      showNotification('Los datos se guardarán al confirmar la compra', 'success');
    }
  }
}

// Cargar datos guardados en el formulario
async function cargarDatosGuardadosEnFormulario() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  if (!currentUser) return;
  
  try {
    const res = await fetch('/.netlify/functions/getDatosEnvio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email })
    });

    const data = await res.json();
    
    if (data.success && data.datos) {
      const datos = data.datos;
      
      // Rellenar formulario con datos guardados
      if (datos.nombre_completo) document.getElementById('envioNombre').value = datos.nombre_completo;
      if (datos.telefono) document.getElementById('envioTelefono').value = datos.telefono;
      if (datos.direccion) document.getElementById('envioDireccion').value = datos.direccion;
      if (datos.ciudad) document.getElementById('envioCiudad').value = datos.ciudad;
      if (datos.estado) document.getElementById('envioEstado').value = datos.estado;
      if (datos.codigo_postal) document.getElementById('envioCP').value = datos.codigo_postal;
      if (datos.referencias) document.getElementById('envioReferencias').value = datos.referencias;
      if (datos.metodo_pago_preferido) {
        document.getElementById('metodoPago').value = datos.metodo_pago_preferido;
        if (typeof toggleTarjetaFields === 'function') toggleTarjetaFields();
      }
      
      // Trigger floating labels
      document.querySelectorAll('#envioForm .field input, #envioForm .field textarea, #envioForm .field select').forEach(inp => {
        const parent = inp.closest('.field');
        if (parent && inp.value && inp.value.trim() !== '') {
          parent.classList.add('filled');
        }
      });
      
      showNotification('Datos cargados correctamente', 'success');
    } else {
      showNotification('No hay datos guardados', 'info');
      // Desactivar el switch
      const switchElement = document.getElementById('usarDatosGuardadosSwitch');
      if (switchElement) switchElement.checked = false;
    }
  } catch (err) {
    console.error('Error al cargar datos guardados:', err);
    showNotification('Error al cargar datos', 'error');
    // Desactivar el switch
    const switchElement = document.getElementById('usarDatosGuardadosSwitch');
    if (switchElement) switchElement.checked = false;
  }
}

// Limpiar formulario de envío
function limpiarFormularioEnvio() {
  document.getElementById('envioNombre').value = '';
  document.getElementById('envioTelefono').value = '';
  document.getElementById('envioDireccion').value = '';
  document.getElementById('envioCiudad').value = '';
  document.getElementById('envioEstado').value = '';
  document.getElementById('envioCP').value = '';
  document.getElementById('envioReferencias').value = '';
  document.getElementById('metodoPago').value = '';
  
  // Limpiar campos de tarjeta
  const nombreTarjeta = document.getElementById('nombreTarjeta');
  const numeroTarjeta = document.getElementById('numeroTarjeta');
  const fechaExpiracion = document.getElementById('fechaExpiracion');
  const cvv = document.getElementById('cvv');
  
  if (nombreTarjeta) nombreTarjeta.value = '';
  if (numeroTarjeta) numeroTarjeta.value = '';
  if (fechaExpiracion) fechaExpiracion.value = '';
  if (cvv) cvv.value = '';
  
  // Ocultar campos de tarjeta
  const tarjetaFields = document.getElementById('tarjetaFields');
  if (tarjetaFields) tarjetaFields.style.display = 'none';
  
  // Remover clase filled de los campos
  document.querySelectorAll('#envioForm .field').forEach(field => {
    field.classList.remove('filled');
  });
}

// Verificar si hay datos guardados al abrir el modal
async function verificarDatosGuardados() {
  const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  if (!currentUser) return;
  
  try {
    const res = await fetch('/.netlify/functions/getDatosEnvio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email })
    });

    const data = await res.json();
    
    // Si hay datos guardados, mostrar un indicador visual en el switch
    const switchElement = document.getElementById('usarDatosGuardadosSwitch');
    if (switchElement && data.success && data.datos) {
      // Agregar un pequeño badge o indicador
      const switchContainer = switchElement.closest('div').querySelector('strong');
      if (switchContainer && !switchContainer.querySelector('.badge-disponible')) {
        const badge = document.createElement('span');
        badge.className = 'badge-disponible';
        badge.textContent = '✓';
        badge.style.cssText = 'background:#4CAF50;color:white;padding:2px 6px;border-radius:10px;font-size:10px;margin-left:6px';
        switchContainer.appendChild(badge);
      }
    }
  } catch (err) {
    console.error('Error al verificar datos guardados:', err);
  }
}
