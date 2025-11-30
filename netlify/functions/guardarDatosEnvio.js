import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Método no permitido" }) };
  }

  const { email, datos } = JSON.parse(event.body);
  if (!email || !datos) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Faltan datos" }) };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    // Verificar si ya existen datos guardados
    const existing = await client.query(
      "SELECT id FROM datos_envio_guardados WHERE usuario = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      // Actualizar
      await client.query(
        `UPDATE datos_envio_guardados SET 
          nombre_completo = $1, 
          telefono = $2, 
          direccion = $3, 
          ciudad = $4, 
          estado = $5, 
          codigo_postal = $6, 
          referencias = $7,
          metodo_pago_preferido = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE usuario = $9`,
        [
          datos.nombreCompleto,
          datos.telefono,
          datos.direccion,
          datos.ciudad,
          datos.estado,
          datos.codigoPostal,
          datos.referencias || '',
          datos.metodoPagoPreferido || '',
          email
        ]
      );
    } else {
      // Insertar
      await client.query(
        `INSERT INTO datos_envio_guardados 
          (usuario, nombre_completo, telefono, direccion, ciudad, estado, codigo_postal, referencias, metodo_pago_preferido)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          email,
          datos.nombreCompleto,
          datos.telefono,
          datos.direccion,
          datos.ciudad,
          datos.estado,
          datos.codigoPostal,
          datos.referencias || '',
          datos.metodoPagoPreferido || ''
        ]
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Datos guardados correctamente" })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al guardar datos" }) };
  } finally {
    await client.end();
  }
}
