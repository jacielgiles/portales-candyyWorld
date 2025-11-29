import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { usuario, productos } = JSON.parse(event.body);

  if (!usuario || !productos || productos.length === 0)
    return { statusCode: 200, body: JSON.stringify({ success:false, message:"Datos incompletos" }) };

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL
  });

  try {
    await client.connect();

    await client.query(
      "INSERT INTO ordenes(usuario, productos, entregado) VALUES($1, $2, false)",
      [usuario, productos]
    );

    // limpiar el carrito
    await client.query(
      "UPDATE users SET carrito = '{}' WHERE usuario = $1",
      [usuario]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success:true, message:"Orden creada" })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error en crearOrden" };
  } finally {
    await client.end();
  }
}
