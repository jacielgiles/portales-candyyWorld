import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Método no permitido" }) };
  }

  const { email } = JSON.parse(event.body);
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Falta el email" }) };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    // Obtener pedidos del usuario con datos de envío
    const result = await client.query(
      `SELECT 
        p.id,
        p.usuario,
        p.productos,
        p.entregado,
        p.fecha,
        d.nombre_completo,
        d.telefono,
        d.direccion,
        d.ciudad,
        d.estado,
        d.codigo_postal
      FROM pedidos p
      LEFT JOIN datos_envio d ON d.pedido_id = p.id
      WHERE p.usuario = $1
      ORDER BY p.fecha DESC`,
      [email]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, pedidos: result.rows })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al obtener pedidos" }) };
  } finally {
    await client.end();
  }
}
