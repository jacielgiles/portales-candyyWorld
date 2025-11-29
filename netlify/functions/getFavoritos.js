import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { email } = JSON.parse(event.body);

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    const resUser = await client.query("SELECT favoritos FROM users WHERE email=$1", [email]);

    if (resUser.rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ success: false, message: "Usuario no encontrado" }) };
    }

    let ids = JSON.parse(resUser.rows[0].favoritos || "[]");

    if (ids.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ success: true, products: [] }) };
    }

    const result = await client.query(
      `SELECT * FROM productos WHERE id = ANY($1::int[])`,
      [ids]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, products: result.rows })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false }) };
  } finally {
    await client.end();
  }
}
