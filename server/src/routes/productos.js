const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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

// Registrar un nuevo producto con imagen (multer)
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre_perfume, categoria, precio_venta, stock_actual, stock_minimo } = req.body;

        // Si hay archivo, guardamos la URL relativa, si no, usamos la URL proporcionada o vacío
        let final_image_url = req.body.imagen_url || '';
        if (req.file) {
            final_image_url = `/uploads/${req.file.filename}`;
        }

        const [result] = await db.query(
            'INSERT INTO productos (nombre_perfume, categoria, imagen_url, precio_venta, stock_actual, stock_minimo) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre_perfume, categoria, final_image_url, precio_venta, stock_actual || 0, stock_minimo || 5]
        );
        res.status(201).json({ id: result.insertId, ...req.body, imagen_url: final_image_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// Actualizar producto o stock con imagen opcional
router.put('/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_perfume, categoria, precio_venta, stock_actual, stock_minimo } = req.body;

        let final_image_url = req.body.imagen_url;
        if (req.file) {
            final_image_url = `/uploads/${req.file.filename}`;
        }

        await db.query(
            'UPDATE productos SET nombre_perfume=?, categoria=?, imagen_url=?, precio_venta=?, stock_actual=?, stock_minimo=? WHERE id=?',
            [nombre_perfume, categoria, final_image_url, precio_venta, stock_actual, stock_minimo, id]
        );
        res.json({ message: 'Producto actualizado con éxito', imagen_url: final_image_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

module.exports = router;
