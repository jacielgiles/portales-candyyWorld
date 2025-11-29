import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Método no permitido" }) };
  }

  const { email, productId } = JSON.parse(event.body);
  if (!email || !productId) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Faltan datos" }) };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    // Obtener favoritos actuales
    const resUser = await client.query("SELECT favoritos FROM users WHERE email=$1", [email]);
    if (resUser.rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ success: false, message: "Usuario no encontrado" }) };
    }

    let favoritos = [];
    try {
      favoritos = JSON.parse(resUser.rows[0].favoritos || "[]");
    } catch {
      favoritos = [];
    }

    // Eliminar de favoritos
    favoritos = favoritos.filter(id => id !== String(productId));

    // Guardar en DB
    await client.query("UPDATE users SET favoritos=$1 WHERE email=$2", [JSON.stringify(favoritos), email]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Eliminado de favoritos", favoritos })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error interno" }) };
  } finally {
    await client.end();
  }
}
