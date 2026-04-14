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
        const { nombre_perfume, categoria, imagen_url, precio_venta, stock_actual, stock_minimo } = req.body;
        const [result] = await db.query(
            'INSERT INTO productos (nombre_perfume, categoria, imagen_url, precio_venta, stock_actual, stock_minimo) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre_perfume, categoria, imagen_url, precio_venta, stock_actual || 0, stock_minimo || 5]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// Actualizar producto o stock
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_perfume, categoria, imagen_url, precio_venta, stock_actual, stock_minimo } = req.body;
        await db.query(
            'UPDATE productos SET nombre_perfume=?, categoria=?, imagen_url=?, precio_venta=?, stock_actual=?, stock_minimo=? WHERE id=?',
            [nombre_perfume, categoria, imagen_url, precio_venta, stock_actual, stock_minimo, id]
        );
        res.json({ message: 'Producto actualizado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

module.exports = router;
