import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success:false, message:"Método no permitido" }) };
  }

  const { email, currentPassword, newPassword } = JSON.parse(event.body);

  if (!email || !currentPassword || !newPassword) {
    return { statusCode: 400, body: JSON.stringify({ success:false, message:"Faltan datos" }) };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL
  });

  try {
    await client.connect();

    const userRes = await client.query("SELECT password FROM users WHERE email=$1", [email]);
    if (userRes.rows.length === 0) return { statusCode: 404, body: JSON.stringify({ success:false, message:"Usuario no encontrado" }) };
    if (userRes.rows[0].password !== currentPassword) return { statusCode: 401, body: JSON.stringify({ success:false, message:"Contraseña actual incorrecta" }) };

    await client.query("UPDATE users SET password=$1 WHERE email=$2", [newPassword, email]);
    return { statusCode: 200, body: JSON.stringify({ success:true, message:"Contraseña actualizada" }) };

  } catch(err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success:false, message:"Error del servidor" }) };
  } finally {
    await client.end();
  }
}
