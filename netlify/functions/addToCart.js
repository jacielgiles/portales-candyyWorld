import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success:false, message:"Método no permitido" }) };
  }

  const { email, productId } = JSON.parse(event.body);
  if (!email || !productId) {
    return { statusCode:400, body: JSON.stringify({ success:false, message:"Faltan datos" }) };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    // Obtener carrito actual
    const resUser = await client.query("SELECT carrito FROM users WHERE email=$1", [email]);
    if (resUser.rows.length === 0) {
      return { statusCode:404, body: JSON.stringify({ success:false, message:"Usuario no encontrado" }) };
    }

    let carrito = [];
    try {
      carrito = JSON.parse(resUser.rows[0].carrito || "[]");
    } catch {
      carrito = [];
    }

    // Añadir nuevo producto
    carrito.push(productId);

    // Guardar en DB
    await client.query("UPDATE users SET carrito=$1 WHERE email=$2", [JSON.stringify(carrito), email]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success:true, message:"Producto añadido al carrito", carrito })
    };

  } catch(err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success:false, message:"Error interno al añadir al carrito" }) };
  } finally {
    await client.end();
  }
}
