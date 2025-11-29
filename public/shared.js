// Funciones compartidas para todos los HTML
const $ = id => document.getElementById(id);

// Modales
const loginModal = $('loginModal');
const registerModal = $('registerModal');
const profileModal = $('profileModal');
const changePassModal = $('changePassModal');
const logoutConfirmModal = $('logoutConfirmModal');
const cartModal = $('cartModal');

// Botones
const userBtn = $('userBtn');
const cartBtn = $('cartBtn');
const closeCartModal = $('closeCartModal');
const cartBadge = $('cartBadge');
const cartItems = $('cartItems');
const cartTotal = $('cartTotal');
const openChangePass = $('openChangePass');
const closeChangePass = $('closeChangePass');
const closeProfileModal = $('closeProfileModal');
const cancelPass = $('cancelPass');
const logoutBtn = $('logoutBtn');
const confirmLogout = $('confirmLogout');
const cancelLogout = $('cancelLogout');

// Formularios y mensajes
const loginForm = $('loginForm');
const registerForm = $('registerForm');
const loginMsg = $('loginMsg');
const regMsg = $('regMsg');
const passMsg = $('passMsg');

// Datos de usuario
const userName = $('userName');
const userEmail = $('userEmail');
const userPedidos = $('userPedidos');
const userBirth = $('userBirth');
const currentPassword = $('currentPassword');
const newPassword = $('newPassword');
const updatePass = $('updatePass');

// Usuario actual
let currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

function show(el) { el.style.display = 'flex' }
function hide(el) { el.style.display = 'none' }

function setUserUI(user) {
  const profileModalContent = profileModal.querySelector('.modal');
  if (!user) {
    hide(profileModal); hide(changePassModal); hide(logoutConfirmModal);
  } else {
    hide(loginModal); hide(registerModal);
    updateCartBadge();
    if (userName) userName.textContent = user.name;
    if (userEmail) userEmail.textContent = user.email;
    if (userBirth) userBirth.textContent = (user.birthdate || '').split('T')[0] || '';
    if (userPedidos) userPedidos.textContent = user.pedidos || '0';
    
    // Mostrar puntos en el perfil
    const userPuntos = document.getElementById('userPuntos');
    if (userPuntos) {
      userPuntos.textContent = user.puntos || '0';
      const descuento = Math.floor((user.puntos || 0) / 100);
      const descuentoMax = descuento > 20 ? 20 : descuento;
      const userDescuento = document.getElementById('userDescuento');
      if (userDescuento) {
        userDescuento.textContent = descuentoMax + '%';
      }
    }

    let adminBtn = null;
    if (profileModalContent) adminBtn = profileModalContent.querySelector('#addProductBtn');
    if (user.email === 'langosta@admin.com') {
      if (!adminBtn && profileModalContent) {
        adminBtn = document.createElement('button');
        adminBtn.id = 'addProductBtn';
        adminBtn.className = 'btn';
        adminBtn.textContent = 'Añadir Producto';
        adminBtn.style.marginTop = '10px';
        adminBtn.addEventListener('click', () => {
          window.location.href = 'admin.html';
        });
        profileModalContent.appendChild(adminBtn);
      }
    } else {
      if (adminBtn) adminBtn.remove();
    }
  }
}

setUserUI(currentUser);

// Navegación y modales
$('toRegister').addEventListener('click', () => { hide(loginModal); show(registerModal) });
$('toLogin').addEventListener('click', () => { hide(registerModal); show(loginModal) });
userBtn.addEventListener('click', async () => {
  if (!currentUser) {
    show(loginModal);
  } else {
    show(profileModal);
    // Activar tab de información por defecto
    switchProfileTab('info');
    // Cargar pedidos si la función existe
    if (typeof mostrarPedidosEnPerfil === 'function') {
      await mostrarPedidosEnPerfil();
    }
  }
});

// Función para cambiar entre tabs del perfil
function switchProfileTab(tabName) {
  // Actualizar botones
  document.querySelectorAll('.profile-tab').forEach(btn => {
    btn.classList.remove('active');
    btn.style.color = '#666';
    btn.style.borderBottom = '3px solid transparent';
  });
  
  const activeBtn = document.querySelector(`.profile-tab[data-tab="${tabName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.color = '#FF9EB4';
    activeBtn.style.borderBottom = '3px solid #FF9EB4';
  }
  
  // Actualizar contenido
  document.querySelectorAll('.profile-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  const activeContent = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  if (activeContent) {
    activeContent.style.display = 'block';
  }
}

// Event listeners para las tabs
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('profile-tab')) {
    const tabName = e.target.getAttribute('data-tab');
    switchProfileTab(tabName);
  }
});
$('closeLoginModal').addEventListener('click', () => hide(loginModal));
$('closeRegisterModal').addEventListener('click', () => hide(registerModal));
closeProfileModal.addEventListener('click', () => hide(profileModal));
openChangePass.addEventListener('click', () => { show(changePassModal); hide(profileModal) });
closeChangePass.addEventListener('click', () => hide(changePassModal));
cancelPass.addEventListener('click', () => hide(changePassModal));

// Carrito
cartBtn.addEventListener('click', () => {
  if (!currentUser) {
    show(loginModal);
    return;
  }
  loadCart();
  show(cartModal);
});
closeCartModal.addEventListener('click', () => hide(cartModal));

// Favoritos
const favoritosBtn = $('favoritosBtn');
const favoritosModal = $('favoritosModal');
const closeFavoritosModal = $('closeFavoritosModal');

favoritosBtn.addEventListener('click', () => {
  if (!currentUser) {
    show(loginModal);
    return;
  }
  loadFavoritos();
  show(favoritosModal);
});
closeFavoritosModal.addEventListener('click', () => hide(favoritosModal));

// Modal de envío
const envioModal = $('envioModal');
const closeEnvioModal = $('closeEnvioModal');
closeEnvioModal.addEventListener('click', () => {
  envioModal.style.display = 'none';
  show(cartModal);
});

function updateCartBadge() {
  if (!currentUser || !currentUser.carrito) {
    cartBadge.classList.add('hidden');
    return;
  }
  let cart = [];
  try { cart = JSON.parse(currentUser.carrito || "[]"); } catch { }
  if (cart.length > 0) {
    cartBadge.textContent = cart.length;
    cartBadge.classList.remove('hidden');
  } else {
    cartBadge.classList.add('hidden');
  }
}

// Función de notificación
function showNotification(message, type = 'success') {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    
    // Agregar estilos inline si no existen en CSS
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        font-size: 15px;
        z-index: 10000;
        display: none;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
      }
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .notification.success {
        background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
      }
      .notification.error {
        background: linear-gradient(135deg, #e53935 0%, #EF5350 100%);
      }
      .notification.info {
        background: linear-gradient(135deg, #2196F3 0%, #42A5F5 100%);
      }
      @media(max-width:768px){
        .notification{right:10px;left:10px;max-width:none;font-size:14px;padding:12px 16px}
      }
    `;
    if (!document.getElementById('notification-styles')) {
      style.id = 'notification-styles';
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// LOGIN
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginMsg.textContent = '';
  const email = $('loginEmail').value.trim();
  const password = $('loginPassword').value.trim();
  if (!email || !password) {
    loginMsg.textContent = 'Completa email y contraseña';
    return;
  }
  try {
    if (email === 'langosta@admin' && password === 'portales') {
      localStorage.setItem('admin', 'true');
      window.location.href = 'admin.html';
      return;
    }

    const res = await fetch('/.netlify/functions/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) {
      loginMsg.textContent = data.message || 'Error al iniciar sesión';
      return;
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    setUserUI(currentUser);
    hide(loginModal);
    showNotification(`¡Bienvenido ${data.user.name}! 🎉`, 'success');
  } catch (err) {
    loginMsg.textContent = 'Error de conexión';
  }
});

// REGISTER
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  regMsg.textContent = '';
  const name = $('regName').value.trim();
  const email = $('regEmail').value.trim();
  const password = $('regPassword').value.trim();
  const confirmPass = $('regConfirmPassword').value.trim();
  const birthdate = $('regBirth').value;
  if (!name || !email || !password || !confirmPass || !birthdate) { regMsg.textContent = 'Completa todos los campos'; return; }
  if (password !== confirmPass) { regMsg.textContent = 'Las contraseñas no coinciden'; return; }
  try {
    const res = await fetch('/.netlify/functions/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, birthdate })
    });
    const data = await res.json();
    if (!data.success) { regMsg.textContent = data.message || 'Error al crear cuenta'; return; }
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    setUserUI(currentUser);
    hide(registerModal);
    showNotification(`¡Cuenta creada exitosamente! Bienvenido ${data.user.name} 🎉`, 'success');
  } catch (err) { regMsg.textContent = 'Error de conexión' }
});

// CERRAR SESIÓN
logoutBtn.addEventListener('click', () => show(logoutConfirmModal));
cancelLogout.addEventListener('click', () => hide(logoutConfirmModal));
confirmLogout.addEventListener('click', () => {
  const userName = currentUser ? currentUser.name : 'Usuario';
  localStorage.removeItem('user');
  currentUser = null;
  setUserUI(currentUser);
  hide(logoutConfirmModal);
  showNotification(`¡Hasta pronto ${userName}! 👋`, 'success');
});

// CAMBIAR CONTRASEÑA
updatePass.addEventListener('click', async () => {
  passMsg.textContent = '';
  const current = currentPassword.value.trim();
  const newP = newPassword.value.trim();
  if (!current || !newP) { passMsg.textContent = 'Completa ambos campos'; return; }
  try {
    const res = await fetch('/.netlify/functions/updatePassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser.email, currentPassword: current, newPassword: newP })
    });
    const data = await res.json();
    passMsg.textContent = data.message;
    if (data.success) {
      currentPassword.value = ''; newPassword.value = '';
      hide(changePassModal);
    }
  } catch (err) { passMsg.textContent = 'Error de conexión' }
});

// BUSCADOR CON FILTROS
const searchInput = $('searchInput');
const searchDropdown = $('searchDropdown');
const categoryOptions = $('categoryOptions');
const saborOptions = $('saborOptions');

async function loadSearchFilters() {
  try {
    const res = await fetch('/.netlify/functions/getProductos', { method: 'POST' });
    const data = await res.json();
    if (!data.success) return;

    const productos = data.products;
    const categorias = [...new Set(productos.map(p => p.categoria))];
    const sabores = [...new Set(productos.map(p => p.sabor))];

    categoryOptions.innerHTML = categorias.map(cat =>
      `<div class="search-option" onclick="searchBy('categoria','${cat}')">${cat}</div>`
    ).join('');

    saborOptions.innerHTML = sabores.map(sab =>
      `<div class="search-option" onclick="searchBy('sabor','${sab}')">${sab}</div>`
    ).join('');
  } catch (err) { console.error(err); }
}

searchInput.addEventListener('focus', () => {
  searchDropdown.classList.add('active');
  if (categoryOptions.innerHTML === '') loadSearchFilters();
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => searchDropdown.classList.remove('active'), 200);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) window.location.href = `productos.html?search=${encodeURIComponent(query)}`;
  }
});

function searchBy(tipo, valor) {
  window.location.href = `productos.html?${tipo}=${encodeURIComponent(valor)}`;
}

loadSearchFilters();

// Floating labels
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.field input, .field textarea, .field select');
  inputs.forEach(inp => {
    const toggle = () => {
      const parent = inp.closest('.field');
      if (!parent) return;
      if (inp.value && inp.value.trim() !== '') parent.classList.add('filled'); else parent.classList.remove('filled');
    };
    toggle();
    inp.addEventListener('input', toggle);
    inp.addEventListener('change', toggle);
    inp.addEventListener('focus', () => {
      const parent = inp.closest('.field'); if (parent) parent.classList.add('focused');
    });
    inp.addEventListener('blur', () => {
      const parent = inp.closest('.field'); if (parent) parent.classList.remove('focused');
    });
  });
});
