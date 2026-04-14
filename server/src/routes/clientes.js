const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// Obtener un cliente, sus ventas y abonos
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [cliente] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
        if (cliente.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });

        res.json(cliente[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
});

// Registrar un nuevo cliente
router.post('/', async (req, res) => {
    try {
        const { nombre, cedula_telefono, direccion } = req.body;
        const [result] = await db.query(
            'INSERT INTO clientes (nombre, cedula_telefono, direccion) VALUES (?, ?, ?)',
            [nombre, cedula_telefono, direccion]
        );
        res.status(201).json({ id: result.insertId, nombre, cedula_telefono, direccion, saldo_total: 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});

module.exports = router;
