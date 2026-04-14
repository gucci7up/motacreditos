const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los pagos (Global) con info de cliente y venta
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT p.*, v.cliente_id, c.nombre as cliente_nombre
            FROM pagos p
            JOIN ventas v ON p.venta_id = v.id
            JOIN clientes c ON v.cliente_id = c.id
            ORDER BY p.fecha_pago DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener historial de pagos' });
    }
});

// Obtener todos los pagos de una venta
router.get('/venta/:ventaId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pagos WHERE venta_id = ? ORDER BY fecha_pago DESC', [req.params.ventaId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener abonos' });
    }
});

// Registrar un abonado / pago a una venta
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { venta_id, monto_abonado, metodo_pago } = req.body;

        // 1. Insertar el pago
        const [result] = await connection.query(
            'INSERT INTO pagos (venta_id, monto_abonado, metodo_pago) VALUES (?, ?, ?)',
            [venta_id, monto_abonado, metodo_pago || 'Efectivo']
        );

        // 2. Obtener cliente_id y deuda restante (lógica manual ante falta de triggers)
        const [ventaRows] = await connection.query(`
            SELECT v.cliente_id, v.monto_total, 
                   (v.monto_total - IFNULL(SUM(p.monto_abonado), 0)) as restante
            FROM ventas v
            LEFT JOIN pagos p ON v.id = p.venta_id
            WHERE v.id = ?
            GROUP BY v.id
        `, [venta_id]);

        if (ventaRows.length > 0) {
            const { cliente_id, restante } = ventaRows[0];

            // 3. Actualizar saldo global del cliente
            await connection.query(
                'UPDATE clientes SET saldo_total = saldo_total - ? WHERE id = ?',
                [monto_abonado, cliente_id]
            );

            // 4. Actualizar estado de la venta
            let nuevoEstado = 'Parcial';
            if (restante <= 0) {
                nuevoEstado = 'Pagado';
            }
            await connection.query('UPDATE ventas SET estado = ? WHERE id = ?', [nuevoEstado, venta_id]);
        }

        await connection.commit();
        res.status(201).json({ id: result.insertId, venta_id, monto_abonado, metodo_pago });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al registrar abono', details: error.message });
    } finally {
        connection.release();
    }
});

// Endpoint para el recibo HTML de un abono específico
router.get('/:id/recibo', async (req, res) => {
    try {
        const pagoId = req.params.id;
        const [pagos] = await db.query(`
            SELECT p.*, v.monto_total, c.nombre as cliente_nombre
            FROM pagos p
            JOIN ventas v ON p.venta_id = v.id
            JOIN clientes c ON v.cliente_id = c.id
            WHERE p.id = ?
        `, [pagoId]);

        if (pagos.length === 0) return res.status(404).send('Pago no encontrado');
        const pago = pagos[0];

        // Obtener balance después de este pago
        const [sumPagos] = await db.query('SELECT SUM(monto_abonado) as total FROM pagos WHERE venta_id = ? AND fecha_pago <= ?', [pago.venta_id, pago.fecha_pago]);
        const acumulado = sumPagos[0].total || 0;
        const restante = parseFloat(pago.monto_total) - acumulado;

        const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Recibo de Pago</title>
      <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; width: 58mm; color: #000; }
        .center { text-align: center; }
        .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        @media print { body { margin: 0; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="center bold" style="font-size:14px; margin-bottom: 5px;">MotaCréditos Perfumes</div>
      <div class="center">COMPROBANTE DE ABONO</div>
      <div class="divider"></div>
      <div>Fecha: ${new Date(pago.fecha_pago).toLocaleDateString()} ${new Date(pago.fecha_pago).toLocaleTimeString()}</div>
      <div>Recibo No: ${pago.id}</div>
      <div>Ticket Venta: #${pago.venta_id}</div>
      <div>Cliente: ${pago.cliente_nombre}</div>
      <div class="divider"></div>
      <div class="row bold"><span>Monto Abonado:</span><span>$${parseFloat(pago.monto_abonado).toFixed(2)}</span></div>
      <div class="row"><span>Método:</span><span>${pago.metodo_pago}</span></div>
      <div class="divider"></div>
      <div class="row"><span>Total Venta:</span><span>$${parseFloat(pago.monto_total).toFixed(2)}</span></div>
      <div class="row"><span>Saldo Restante:</span><span>$${restante.toFixed(2)}</span></div>
      <div class="divider"></div>
      <div class="center" style="font-size: 10px;">¡Gracias por su pago!</div>
      <script>window.onload = function() { window.print(); }</script>
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
