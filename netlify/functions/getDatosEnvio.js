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

    const result = await client.query(
      "SELECT * FROM datos_envio_guardados WHERE usuario = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, datos: null })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, datos: result.rows[0] })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al obtener datos" }) };
  } finally {
    await client.end();
  }
}
