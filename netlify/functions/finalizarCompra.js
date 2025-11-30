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

    // Obtener carrito y puntos del usuario
    const resUser = await client.query("SELECT carrito, puntos FROM users WHERE email=$1", [email]);
    if (resUser.rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ success: false, message: "Usuario no encontrado" }) };
    }
    
    const puntosActuales = parseInt(resUser.rows[0].puntos) || 0;

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
    
    // Calcular descuento por puntos SOLO si el usuario quiere usarlos
    const usarPuntos = datosEnvio.usarPuntos || false;
    let descuentoPorcentaje = 0;
    let puntosUsados = 0;
    
    if (usarPuntos && puntosActuales >= 100) {
      descuentoPorcentaje = Math.floor(puntosActuales / 100);
      const descuentoMaximo = descuentoPorcentaje > 20 ? 20 : descuentoPorcentaje;
      puntosUsados = descuentoMaximo * 100; // Puntos que se usarán para el descuento
      descuentoPorcentaje = descuentoMaximo;
    }
    
    // Fórmula de puntos ganados: base 20 + (precio total * 0.5) + (cantidad * 10)
    // Máximo 500 puntos
    let puntosGanados = Math.floor(20 + (totalPrecio * 0.5) + (cantidadProductos * 10));
    if (puntosGanados > 500) puntosGanados = 500;
    if (puntosGanados < 20) puntosGanados = 20;
    
    // Calcular puntos finales: actuales - usados + ganados
    const puntosFinales = Math.max(0, puntosActuales - puntosUsados + puntosGanados);
    
    // Decrementar stock de los productos
    for (const prodId of productosInt) {
      await client.query(
        "UPDATE productos SET stock = GREATEST(stock - 1, 0) WHERE id = $1",
        [prodId]
      );
    }
    
    // Incrementar contador de pedidos y actualizar puntos
    // Convertir pedidos de texto a número, incrementar, y volver a texto
    await client.query(
      `UPDATE users SET 
        carrito = $1, 
        pedidos = CAST(COALESCE(NULLIF(pedidos, '')::integer, 0) + 1 AS TEXT),
        puntos = $2
      WHERE email = $3`,
      [JSON.stringify([]), puntosFinales, email]
    );
    
    // Guardar datos de envío si el usuario lo solicitó
    if (datosEnvio.guardarDatos) {
      try {
        const existingData = await client.query(
          "SELECT id FROM datos_envio_guardados WHERE usuario = $1",
          [email]
        );

        if (existingData.rows.length > 0) {
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
              datosEnvio.nombreCompleto,
              datosEnvio.telefono,
              datosEnvio.direccion,
              datosEnvio.ciudad,
              datosEnvio.estado,
              datosEnvio.codigoPostal,
              datosEnvio.referencias || '',
              datosEnvio.metodoPago || '',
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
              datosEnvio.nombreCompleto,
              datosEnvio.telefono,
              datosEnvio.direccion,
              datosEnvio.ciudad,
              datosEnvio.estado,
              datosEnvio.codigoPostal,
              datosEnvio.referencias || '',
              datosEnvio.metodoPago || ''
            ]
          );
        }
      } catch (saveErr) {
        console.error("Error al guardar datos de envío:", saveErr);
        // No fallar la compra si falla el guardado de datos
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: "Compra finalizada correctamente", 
        pedidoId,
        puntosGanados: puntosGanados,
        puntosUsados: puntosUsados,
        puntosFinales: puntosFinales,
        descuentoAplicado: descuentoPorcentaje,
        datosGuardados: datosEnvio.guardarDatos || false
      })
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Error al finalizar la compra: " + err.message }) };
  } finally {
    await client.end();
  }
}
