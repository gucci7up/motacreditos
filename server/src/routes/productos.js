const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los perfumes/productos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos ORDER BY nombre_perfume ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Registrar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { nombre_perfume, precio_venta } = req.body;
        const [result] = await db.query(
            'INSERT INTO productos (nombre_perfume, precio_venta) VALUES (?, ?)',
            [nombre_perfume, precio_venta]
        );
        res.status(201).json({ id: result.insertId, nombre_perfume, precio_venta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

module.exports = router;
