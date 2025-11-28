import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    if (!body.productId) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: false, message: "Falta productId" })
      };
    }

    const client = new Client({
      connectionString: process.env.NETLIFY_DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Obligatorio para Neon
    });

    await client.connect();

    const result = await client.query(
      "DELETE FROM productos WHERE id = $1 RETURNING id",
      [body.productId]
    );

    await client.end();

    if (result.rowCount === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: "No existe un producto con ese ID"
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Producto eliminado correctamente"
      })
    };

  } catch (err) {
    console.error("Error deleteProducto:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Error interno en deleteProducto"
      })
    };
  }
}
