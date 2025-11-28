const dbStatus = document.getElementById('dbStatus');
const productsContainer = document.getElementById('products');

async function cargarProductos() {
    try {
        const res = await fetch('/.netlify/functions/getProductos', { method: 'POST' });
        const data = await res.json();

        if (!data.success) {
            dbStatus.textContent = `Error: ${data.message}`;
            return;
        }

        // Mostrar el estado de la conexión
        dbStatus.textContent = data.message; 

        const productos = data.products;
        if (productos.length === 0) return;

        // Mostrar productos de México
        productos.forEach(prod => {
            if (prod.pais === 'México') {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.style.border = '1px solid #ccc';
                card.style.padding = '12px';
                card.style.borderRadius = '8px';
                card.style.width = '200px';
                card.innerHTML = `
                    <img src="${prod.imagen}" alt="${prod.nombre}" style="width:100%;border-radius:6px">
                    <h3>${prod.nombre}</h3>
                    <p>${prod.descripcion}</p>
                    <p>Stock: <span>${prod.stock}</span></p>
                `;
                productsContainer.appendChild(card);
            }
        });

    } catch (err) {
        console.error(err);
        dbStatus.textContent = 'Error al conectar con la DB.';
    }
}

cargarProductos();
