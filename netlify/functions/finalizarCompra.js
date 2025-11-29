import pkg from "pg";
const { Client } = pkg;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Método no permitido" }) };
  }

  const { email, datosEnvio } = JSON.parse(event.body);
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Falta el email" }) };
  }

  if (!datosEnvio) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Faltan datos de envío" }) };
  }

  const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });

  try {
    await client.connect();

    // Obtener carrito del usuario
    const resUser = await client.query("SELECT carrito FROM users WHERE email=$1", [email]);
    if (resUser.rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ success: false, message: "Usuario no encontrado" }) };
    }

    let carrito = [];
    try {
      carrito = JSON.parse(resUser.rows[0].carrito || "[]");
    } catch {
      carrito = [];
    }

    if (carrito.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ success: false, message: "El carrito está vacío" }) };
    }

    // Convertir los IDs de string a integer para el array de PostgreSQL
    const productosInt = carrito.map(id => parseInt(id));

    // Insertar en la tabla pedidos
    const pedidoResult = await client.query(
      "INSERT INTO pedidos(usuario, productos, entregado) VALUES($1, $2, false) RETURNING id",
      [email, productosInt]
    );

    const pedidoId = pedidoResult.rows[0].id;

    // Insertar datos de envío
    await client.query(
      `INSERT INTO datos_envio(
        pedido_id, usuario, nombre_completo, telefono, direccion, 
        ciudad, estado, codigo_postal, referencias, metodo_pago,
        nombre_tarjeta, numero_tarjeta, fecha_expiracion, cvv
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        pedidoId,
        email,
        datosEnvio.nombreCompleto,
        datosEnvio.telefono,
        datosEnvio.direccion,
        datosEnvio.ciudad,
        datosEnvio.estado,
        datosEnvio.codigoPostal,
        datosEnvio.referencias || '',
        datosEnvio.metodoPago,
        datosEnvio.nombreTarjeta || null,
        datosEnvio.numeroTarjeta || null,
        datosEnvio.fechaExpiracion || null,
        datosEnvio.cvv || null
      ]
    );

    // Calcular puntos basados en el precio total y cantidad de productos
    // Obtener precios de los productos
    const productosResult = await client.query(
      `SELECT precio FROM productos WHERE id = ANY($1::int[])`,
      [productosInt]
    );
    
    let totalPrecio = 0;
    productosResult.rows.forEach(prod => {
      totalPrecio += parseFloat(prod.precio);
    });
    
    const cantidadProductos = productosInt.length;
    
    // Fórmula de puntos: base 20 + (precio total * 0.5) + (cantidad * 10)
    // Máximo 500 puntos
    let puntos = Math.floor(20 + (totalPrecio * 0.5) + (cantidadProductos * 10));
    if (puntos > 500) puntos = 500;
    if (puntos < 20) puntos = 20;
    
    // Incrementar contador de pedidos y sumar puntos
    await client.query(
      "UPDATE users SET carrito=$1, pedidos = COALESCE(pedidos, 0) + 1, puntos = COALESCE(puntos, 0) + $2 WHERE email=$3",
      [JSON.stringify([]), puntos, email]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Compra finalizada correctamente", 
        pedidoId,
        puntosGanados: puntos
      })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al finalizar la compra: " + err.message }) };
  } finally {
    await client.end();
  }
}
