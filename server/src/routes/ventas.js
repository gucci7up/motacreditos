const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todas las ventas (con info de cliente)
router.get('/', async (req, res) => {
    try {
        const query = `
      SELECT v.*, c.nombre as cliente_nombre,
             IFNULL((SELECT SUM(monto_abonado) FROM pagos WHERE venta_id = v.id), 0) as total_pagado
      FROM ventas v 
      JOIN clientes c ON v.cliente_id = c.id 
      ORDER BY v.fecha DESC
    `;
        const [rows] = await db.query(query);
        // Calcular saldo_pendiente en JS o SQL
        const results = rows.map(r => ({
            ...r,
            saldo_pendiente: parseFloat(r.monto_total) - parseFloat(r.total_pagado)
        }));
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

// Obtener ventas de un cliente específico
router.get('/cliente/:clienteId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM ventas WHERE cliente_id = ? ORDER BY fecha DESC', [req.params.clienteId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener ventas del cliente' });
    }
});

// Registrar nueva venta
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { cliente_id, producto_id, cantidad, monto_total } = req.body;

        // 1. Registrar la venta
        const [result] = await connection.query(
            'INSERT INTO ventas (cliente_id, producto_id, cantidad, monto_total) VALUES (?, ?, ?, ?)',
            [cliente_id, producto_id, cantidad || 1, monto_total]
        );

        // 2. Descontar stock si hay un producto seleccionado
        if (producto_id) {
            await connection.query(
                'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
                [cantidad || 1, producto_id]
            );
        }

        // 3. Actualizar saldo del cliente (Lógica manual ante falta de triggers)
        await connection.query(
            'UPDATE clientes SET saldo_total = saldo_total + ? WHERE id = ?',
            [monto_total, cliente_id]
        );

        await connection.commit();
        res.status(201).json({ id: result.insertId, ...req.body, estado: 'Pendiente' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al registrar venta' });
    } finally {
        connection.release();
    }
});

// Endpoint para el recibo HTML
router.get('/:id/recibo', async (req, res) => {
    try {
        const ventaId = req.params.id;
        const [ventas] = await db.query(`
      SELECT v.*, c.nombre as cliente_nombre, c.cedula_telefono 
      FROM ventas v 
      JOIN clientes c ON v.cliente_id = c.id 
      WHERE v.id = ?
    `, [ventaId]);

        if (ventas.length === 0) return res.status(404).send('Venta no encontrada');
        const venta = ventas[0];

        // Buscar abonos relacionados a esta venta
        const [pagos] = await db.query('SELECT * FROM pagos WHERE venta_id = ?', [ventaId]);
        const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto_abonado), 0);
        const balance = parseFloat(venta.monto_total) - totalPagado;

        // Generar HTML optimizado para impresora de 58mm (aprox 200px)
        const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Recibo</title>
      <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; width: 58mm; color: #000; }
        .center { text-align: center; }
        .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        @media print {
            body { margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="center bold" style="font-size:14px; margin-bottom: 5px;">MotaCréditos Perfumes</div>
      <div class="center">Tel: 809-XXX-XXXX</div>
      <div class="divider"></div>
      <div>Fecha: ${new Date(venta.fecha).toLocaleDateString()} ${new Date(venta.fecha).toLocaleTimeString()}</div>
      <div>Ticket No: ${venta.id}</div>
      <div>Cliente: ${venta.cliente_nombre}</div>
      <div class="divider"></div>
      <div class="bold" style="margin-bottom:5px;">Detalle de Cuenta:</div>
      <div class="row"><span>Monto Venta:</span><span>$${parseFloat(venta.monto_total).toFixed(2)}</span></div>
      <div class="row"><span>Abonado:</span><span>$${totalPagado.toFixed(2)}</span></div>
      <div class="row bold"><span>Restante:</span><span>$${balance.toFixed(2)}</span></div>
      <div class="divider"></div>
      <div class="center bold">Estado: ${venta.estado}</div>
      <div class="divider"></div>
      <div class="center" style="font-size: 10px;">¡Gracias por preferirnos!</div>
      
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
    `;
        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generando recibo');
    }
});


module.exports = router;
