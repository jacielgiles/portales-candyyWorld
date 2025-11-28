import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success:false, message:"Método no permitido" }) };
  }

  const { name, email, password, birthdate } = JSON.parse(event.body);

  if (!name || !email || !password || !birthdate) {
    return { statusCode: 400, body: JSON.stringify({ success:false, message:"Faltan datos" }) };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL
  });

  try {
    await client.connect();

    const exists = await client.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length > 0) {
      return { statusCode: 400, body: JSON.stringify({ success:false, message:"El correo ya está registrado" }) };
    }

    const result = await client.query(
      `INSERT INTO users (name, email, password, birthdate)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, birthdate, pedidos`,
      [name, email, password, birthdate]
    );

    return { statusCode: 200, body: JSON.stringify({ success:true, message:"Usuario creado", user: result.rows[0] }) };

  } catch(err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success:false, message:"Error del servidor" }) };
  } finally {
    await client.end();
  }
}
