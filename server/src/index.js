const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Diagnostic / Health Route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), env: process.env.NODE_ENV });
});

// Rutas API
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/pagos', require('./routes/pagos'));

// Servir archivos de imagen subidos
const UPLOADS_PATH = path.resolve(__dirname, '../uploads'); // Move to server root
const fs = require('fs');
if (!fs.existsSync(UPLOADS_PATH)) {
    try {
        fs.mkdirSync(UPLOADS_PATH, { recursive: true });
        console.log(`[INIT] Carpeta de uploads creada en: ${UPLOADS_PATH}`);
    } catch (err) {
        console.error(`[INIT ERROR] No se pudo crear la carpeta de uploads: ${err.message}`);
    }
} else {
    console.log(`[INIT] Carpeta de uploads detectada en: ${UPLOADS_PATH}`);
}
app.use('/uploads', express.static(UPLOADS_PATH));

// Servir frontend estático para producción (dist de vite)
const clientBuildPath = path.resolve(__dirname, '../../client/dist');
console.log('Serving static files from:', clientBuildPath);
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
    const indexFile = path.resolve(clientBuildPath, 'index.html');
    res.sendFile(indexFile, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(404).send('Static files not found or still building. Check logs.');
        }
    });
});

// Inicio del servidor
app.listen(PORT, async () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);

    // Test and Init DB
    const db = require('./config/db');
    try {
        await db.query('SELECT 1');
        console.log(`[DB] Conexión exitosa a ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);

        // Auto-initialize tables if they don't exist
        const schemaPath = path.resolve(__dirname, '../../schema.sql');
        if (fs.existsSync(schemaPath)) {
            let schema = fs.readFileSync(schemaPath, 'utf8');

            // Clean up schema for multipleStatements:
            // 1. Remove DELIMITER lines
            // 2. Replace the custom delimiter // with ;
            const cleanSchema = schema
                .replace(/^DELIMITER.*$/gm, '')
                .replace(/\/\//g, ';')
                .trim();

            if (cleanSchema) {
                try {
                    await db.query(cleanSchema);
                    console.log('[DB] Inicialización de tablas y triggers completada con éxito.');
                } catch (err) {
                    // Si ya existen, MySQL dará error, pero intentamos procesar
                    if (err.message.includes('already exists') || err.message.includes('Table already exists')) {
                        console.log('[DB] Las tablas ya existen, saltando inicialización.');
                    } else {
                        console.error(`[DB INIT ERROR] Error al ejecutar el esquema: ${err.message}`);
                    }
                }
            }
        }
    } catch (err) {
        console.error(`[DB ERROR] No se pudo conectar a la base de datos. Host: ${process.env.DB_HOST || 'localhost'}, Error: ${err.message}`);
    }
});
