const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Configuración de Multer
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const fs = require('fs');
if (!fs.existsSync(UPLOADS_DIR)) {
    try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (e) { console.error('Error creating uploads dir:', e); }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('imagen');

// Wrapper para manejar errores de multer
const handleUpload = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: 'Error de subida de archivo', details: err.message });
        } else if (err) {
            return res.status(500).json({ error: 'Error interno en subida', details: err.message });
        }
        next();
    });
};

// Obtener todos los perfumes/productos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos ORDER BY nombre_perfume ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos', details: error.message });
    }
});

// Registrar un nuevo producto con imagen (multer)
router.post('/', handleUpload, async (req, res) => {
    try {
        const { nombre_perfume, categoria } = req.body;

        // Convert to numbers and handle empty strings
        const precio_venta = parseFloat(req.body.precio_venta) || 0;
        const stock_actual = parseInt(req.body.stock_actual) || 0;
        const stock_minimo = parseInt(req.body.stock_minimo) || 5;

        if (!nombre_perfume) {
            return res.status(400).json({ error: 'El nombre del perfume es obligatorio' });
        }

        // Si hay archivo, guardamos la URL relativa, si no, usamos la URL proporcionada o vacío
        let final_image_url = req.body.imagen_url || '';
        if (req.file) {
            final_image_url = `/uploads/${req.file.filename}`;
        }

        const [result] = await db.query(
            'INSERT INTO productos (nombre_perfume, categoria, imagen_url, precio_venta, stock_actual, stock_minimo) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre_perfume, categoria, final_image_url, precio_venta, stock_actual, stock_minimo]
        );
        res.status(201).json({ id: result.insertId, nombre_perfume, categoria, imagen_url: final_image_url });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({
            error: 'Error al crear producto',
            details: error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

// Actualizar producto o stock con imagen opcional
router.put('/:id', handleUpload, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_perfume, categoria } = req.body;

        const precio_venta = parseFloat(req.body.precio_venta) || 0;
        const stock_actual = parseInt(req.body.stock_actual) || 0;
        const stock_minimo = parseInt(req.body.stock_minimo) || 5;

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
        res.status(500).json({ error: 'Error al actualizar producto', details: error.message });
    }
});

module.exports = router;
