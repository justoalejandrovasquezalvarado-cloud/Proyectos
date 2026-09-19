const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/pedidos
// Recibe los datos del carrito, procesa la transacción e inserta el
// pedido y sus detalles. Body esperado:
// {
//   usuario: { nombre, correo, telefono, direccion },
//   items: [ { producto_id, cantidad, precio_unitario } ],
//   total
// }
router.post('/', async (req, res) => {
  const { usuario, items, total } = req.body;

  // Validaciones básicas
  if (!usuario || !usuario.nombre || !usuario.correo || !usuario.telefono || !usuario.direccion) {
    return res.status(400).json({ error: 'Datos de entrega incompletos' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito no puede estar vacío' });
  }
  if (!total || total <= 0) {
    return res.status(400).json({ error: 'Total de pedido inválido' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Buscar o crear usuario por correo
    let usuarioId;
    const [existentes] = await connection.query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [usuario.correo]
    );

    if (existentes.length > 0) {
      usuarioId = existentes[0].id;
      await connection.query(
        'UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?',
        [usuario.nombre, usuario.telefono, usuario.direccion, usuarioId]
      );
    } else {
      const [resultUsuario] = await connection.query(
        'INSERT INTO usuarios (nombre, correo, telefono, direccion) VALUES (?, ?, ?, ?)',
        [usuario.nombre, usuario.correo, usuario.telefono, usuario.direccion]
      );
      usuarioId = resultUsuario.insertId;
    }

    // 2. Crear el pedido
    const [resultPedido] = await connection.query(
      'INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, ?)',
      [usuarioId, total, 'pendiente']
    );
    const pedidoId = resultPedido.insertId;

    // 3. Insertar detalles del pedido
    for (const item of items) {
      if (!item.producto_id || !item.cantidad || item.cantidad <= 0) {
        throw new Error('Item de carrito inválido');
      }
      await connection.query(
        'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, item.producto_id, item.cantidad, item.precio_unitario]
      );
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido_id: pedidoId,
      estado: 'pendiente'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: 'No se pudo procesar el pedido' });
  } finally {
    connection.release();
  }
});

// GET /api/pedidos/:id
// Consulta el resumen e información de estado de un pedido específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [pedidos] = await pool.query(
      `SELECT p.id, p.fecha, p.total, p.estado,
              u.nombre AS cliente_nombre, u.correo, u.telefono, u.direccion
       FROM pedidos p
       JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.id = ?`,
      [id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const [detalles] = await pool.query(
      `SELECT d.cantidad, d.precio_unitario, pr.nombre AS producto_nombre
       FROM detalles_pedido d
       JOIN productos pr ON pr.id = d.producto_id
       WHERE d.pedido_id = ?`,
      [id]
    );

    res.json({
      ...pedidos[0],
      items: detalles
    });
  } catch (error) {
    console.error('Error al consultar el pedido:', error);
    res.status(500).json({ error: 'Error al consultar el pedido' });
  }
});

module.exports = router;
