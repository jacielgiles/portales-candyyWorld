import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Método no permitido" }) };
  }

  const { adminEmail } = JSON.parse(event.body);
  
  // Verificar que sea el admin
  if (adminEmail !== 'langosta@admin.com') {
    return { statusCode: 403, body: JSON.stringify({ success: false, message: "No autorizado" }) };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    // Obtener todos los usuarios
    const users = await client.query(
      `SELECT id, name, email, birthdate, carrito, favoritos FROM users ORDER BY id DESC`
    );

    // Obtener todos los pedidos con datos de envío
    const pedidos = await client.query(
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
        d.codigo_postal,
        d.metodo_pago
      FROM pedidos p
      LEFT JOIN datos_envio d ON d.pedido_id = p.id
      ORDER BY p.fecha DESC`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        users: users.rows,
        pedidos: pedidos.rows
      })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al obtener datos" }) };
  } finally {
    await client.end();
  }
}
