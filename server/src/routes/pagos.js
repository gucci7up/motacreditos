const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

module.exports = router;
