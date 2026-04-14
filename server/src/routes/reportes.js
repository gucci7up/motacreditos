const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener estadísticas generales
router.get('/stats', async (req, res) => {
    try {
        const queryVentas = 'SELECT SUM(monto_total) as total_ventas, COUNT(*) as count_ventas FROM ventas';
        const queryPagos = 'SELECT SUM(monto_abonado) as total_pagos FROM pagos';
        const queryClientes = 'SELECT SUM(saldo_total) as deuda_total FROM clientes';

        const [[ventas]] = await db.query(queryVentas);
        const [[pagos]] = await db.query(queryPagos);
        const [[clientes]] = await db.query(queryClientes);

        res.json({
            total_ventas: parseFloat(ventas.total_ventas || 0),
            count_ventas: ventas.count_ventas,
            total_pagos: parseFloat(pagos.total_pagos || 0),
            deuda_total: parseFloat(clientes.deuda_total || 0)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Ventas vs Pagos por día (últimos 30 días)
router.get('/series', async (req, res) => {
    try {
        const queryVentas = `
            SELECT DATE(fecha) as fecha, SUM(monto_total) as ventas
            FROM ventas
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(fecha)
            ORDER BY fecha ASC
        `;
        const queryPagos = `
            SELECT DATE(fecha_pago) as fecha, SUM(monto_abonado) as pagos
            FROM pagos
            WHERE fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(fecha_pago)
            ORDER BY fecha ASC
        `;

        const [vRows] = await db.query(queryVentas);
        const [pRows] = await db.query(queryPagos);

        // Combinar datos por fecha
        const combined = {};
        vRows.forEach(r => {
            const f = r.fecha.toISOString().split('T')[0];
            combined[f] = { fecha: f, ventas: parseFloat(r.ventas), pagos: 0 };
        });
        pRows.forEach(r => {
            const f = r.fecha.toISOString().split('T')[0];
            if (!combined[f]) {
                combined[f] = { fecha: f, ventas: 0, pagos: parseFloat(r.pagos) };
            } else {
                combined[f].pagos = parseFloat(r.pagos);
            }
        });

        const result = Object.values(combined).sort((a, b) => a.fecha.localeCompare(b.fecha));
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener series de tiempo' });
    }
});

// Top Productos vendidos
router.get('/top-productos', async (req, res) => {
    try {
        const query = `
            SELECT p.nombre_perfume, SUM(v.cantidad) as total_vendido, SUM(v.monto_total) as total_recaudado
            FROM ventas v
            JOIN productos p ON v.producto_id = p.id
            GROUP BY v.producto_id
            ORDER BY total_vendido DESC
            LIMIT 5
        `;
        const [rows] = await db.query(query);
        res.json(rows.map(r => ({
            name: r.nombre_perfume,
            vendido: parseInt(r.total_vendido),
            monto: parseFloat(r.total_recaudado)
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener top productos' });
    }
});

module.exports = router;
