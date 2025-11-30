import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success:false, message:"Método no permitido" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode:400, body: JSON.stringify({ success:false, message:"JSON inválido" }) };
  }

  const {
    categoria,
    nombre,
    imagen,
    descripcion,
    stock,
    pais,
    cantidad,
    sabor,
    precio,
    marca
  } = data;

  // ---- VALIDACIÓN ----
  if (
    !categoria || !nombre || !imagen || !descripcion ||
    stock === undefined || stock === null || isNaN(parseInt(stock)) ||
    !pais || !cantidad || !sabor ||
    precio === undefined || precio === null || isNaN(parseFloat(precio))
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success:false, message:"Faltan datos" })
    };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    const query = `
      INSERT INTO productos (categoria, nombre, imagen, descripcion, stock, pais, cantidad, sabor, precio, marca)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
    `;

    const values = [
      categoria,
      nombre,
      imagen,
      descripcion,
      parseInt(stock),
      pais,
      cantidad,
      sabor,
      parseFloat(precio),
      marca || null
    ];

    const result = await client.query(query, values);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Producto agregado correctamente",
        productId: result.rows[0].id
      })
    };

  } catch (err) {
    console.error(err);
    return { statusCode:500, body: JSON.stringify({ success:false, message:"Error interno en la DB" }) };
  } finally {
    await client.end();
  }
}
