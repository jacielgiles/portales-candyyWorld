import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success:false, message:"Método no permitido" }) };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    const result = await client.query(
      "SELECT id, categoria, nombre, imagen, descripcion, cantidad, sabor, stock, precio, pais FROM productos ORDER BY id ASC"
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success:true, message:"Productos cargados", products: result.rows })
    };
  } catch(err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success:false, message:"Error al cargar productos" }) };
  } finally {
    await client.end();
  }
}
