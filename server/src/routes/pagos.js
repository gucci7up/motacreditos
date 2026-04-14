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
    try {
        const { venta_id, monto_abonado, metodo_pago } = req.body;
        // Nota: El trigger 'after_pago_insert' restará el monto del saldo_total del cliente 
        // y actualizará el estado de la venta.
        const [result] = await db.query(
            'INSERT INTO pagos (venta_id, monto_abonado, metodo_pago) VALUES (?, ?, ?)',
            [venta_id, monto_abonado, metodo_pago || 'Efectivo']
        );
        res.status(201).json({ id: result.insertId, venta_id, monto_abonado, metodo_pago });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar abono' });
    }
});

module.exports = router;
