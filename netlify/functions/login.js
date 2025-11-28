import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success:false, message:"Método no permitido" }) };
  }

  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ success:false, message:"Faltan datos" }) };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL
  });

  try {
    await client.connect();

    const result = await client.query(
      "SELECT id, name, email, birthdate, pedidos FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return { statusCode: 401, body: JSON.stringify({ success:false, message:"Datos incorrectos" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success:true, message:"Inicio de sesión exitoso", user: result.rows[0] }) };

  } catch(err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success:false, message:"Error del servidor" }) };
  } finally {
    await client.end();
  }
}
