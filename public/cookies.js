// Sistema de notificación de cookies con animación mejorada
(function() {
  // Crear estilos CSS
  const styles = `
    <style>
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }
      
      #cookieNotice {
        animation: slideUp 0.5s ease-out;
      }
      
      #cookieNotice.hiding {
        animation: slideDown 0.4s ease-in;
      }
      
      .cookie-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .cookie-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #ffceda 0%, #FF9EB4 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;
      }
      
      @media (max-width: 768px) {
        #cookieNotice {
          padding: 16px !important;
        }
        .cookie-content {
          flex-direction: column !important;
          text-align: center;
        }
        .cookie-icon {
          margin: 0 auto 12px auto;
        }
      }
    </style>
  `;
  
  // Crear el HTML de la notificación mejorado
  const cookieHTML = `
    <div id="cookieNotice" style="display:none;position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg, #ffffff 0%, #fff5f8 100%);border-top:4px solid #FF9EB4;padding:24px;box-shadow:0 -8px 24px rgba(255,156,180,0.2);z-index:10000">
      <div class="cookie-content" style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:20px;flex:1;min-width:300px">
          <div class="cookie-icon">🍪</div>
          <div>
            <h4 style="margin:0 0 8px 0;color:#FF9EB4;font-size:20px;font-weight:700">Uso de Cookies</h4>
            <p style="margin:0;color:#666;font-size:14px;line-height:1.6">
              Utilizamos cookies para mejorar tu experiencia de navegación, recordar tus preferencias y analizar el tráfico del sitio. 
              Al hacer clic en "Aceptar todas", aceptas el uso de todas las cookies.
            </p>
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button onclick="acceptCookies()" class="cookie-btn" style="padding:14px 28px;background:linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);color:white;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:15px;transition:all 0.3s;box-shadow:0 4px 12px rgba(76,175,80,0.3)">
            Aceptar todas
          </button>
          <button onclick="rejectCookies()" class="cookie-btn" style="padding:14px 28px;background:white;color:#666;border:2px solid #e0e0e0;border-radius:10px;font-weight:600;cursor:pointer;font-size:15px;transition:all 0.3s">
            Solo necesarias
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Insertar en el body cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // Insertar estilos
    document.head.insertAdjacentHTML('beforeend', styles);
    
    // Insertar el HTML
    document.body.insertAdjacentHTML('beforeend', cookieHTML);
    
    // Mostrar si no se ha aceptado
    const cookieAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookieAccepted) {
      const notice = document.getElementById('cookieNotice');
      if (notice) {
        // Pequeño delay para que la animación se vea
        setTimeout(() => {
          notice.style.display = 'block';
        }, 500);
      }
    }
  }
})();

// Funciones globales para los botones con animación
function acceptCookies() {
  localStorage.setItem('cookiesAccepted', 'true');
  const notice = document.getElementById('cookieNotice');
  if (notice) {
    notice.classList.add('hiding');
    setTimeout(() => {
      notice.style.display = 'none';
    }, 400);
  }
}

function rejectCookies() {
  localStorage.setItem('cookiesAccepted', 'false');
  const notice = document.getElementById('cookieNotice');
  if (notice) {
    notice.classList.add('hiding');
    setTimeout(() => {
      notice.style.display = 'none';
    }, 400);
  }
}
