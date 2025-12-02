import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ success: false, message: "Método no permitido" }) 
    };
  }

  const producto = JSON.parse(event.body);
  
  if (!producto.id) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ success: false, message: "ID de producto requerido" }) 
    };
  }

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
        producto.pais || 'México',
        producto.cantidad || '',
        producto.sabor || '',
        producto.marca,
        producto.id
      ]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Producto actualizado correctamente" 
      })
    };
  } catch (err) {
    console.error(err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        success: false, 
        message: "Error al actualizar producto: " + err.message 
      }) 
    };
  } finally {
    await client.end();
  }
}
