import { Client } from "pg";

export async function handler(event, context) {
  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false } // necesario para Neon
  });

  try {
    await client.connect();
    
    // 🟢 EJEMPLO simple: consulta
    const result = await client.query("SELECT NOW()");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Conexión exitosa con Neon 🚀",
        time: result.rows[0]
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message
      })
    };
  } finally {
    await client.end();
  }
}
