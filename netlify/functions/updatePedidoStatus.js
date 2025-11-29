import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Método no permitido" }) };
  }

  const { adminEmail, pedidoId, entregado } = JSON.parse(event.body);
  
  // Verificar que sea el admin
  if (adminEmail !== 'langosta@admin.com') {
    return { statusCode: 403, body: JSON.stringify({ success: false, message: "No autorizado" }) };
  }

  if (!pedidoId || entregado === undefined) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Faltan datos" }) };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    await client.query(
      "UPDATE pedidos SET entregado = $1 WHERE id = $2",
      [entregado, pedidoId]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Estado actualizado" })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al actualizar" }) };
  } finally {
    await client.end();
  }
}
