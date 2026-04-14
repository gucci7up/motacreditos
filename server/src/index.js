const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');
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

// Debug Routes (Before other routes)
app.get('/api/debug/logs', (req, res) => {
    res.type('text/plain').send(logger.getLogs(200));
});

app.get('/api/debug/test-db', async (req, res) => {
    const db = require('./config/db');
    try {
        const [rows] = await db.query('SHOW TABLES');
        res.json({ status: 'ok', tables: rows, env: process.env.NODE_ENV });
    } catch (err) {
        logger.error('Debug DB Test failed', err);
        res.status(500).json({ status: 'error', details: err.message });
    }
});

// Rutas API
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/pagos', require('./routes/pagos'));

// Servir archivos de imagen subidos
// En Docker WD es /app/server, así que esto crea /app/server/uploads
const UPLOADS_PATH = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_PATH)) {
    try {
        fs.mkdirSync(UPLOADS_PATH, { recursive: true });
        logger.log(`Carpeta de uploads creada en: ${UPLOADS_PATH}`);
    } catch (err) {
        logger.error('No se pudo crear la carpeta de uploads', err);
    }
} else {
    logger.log(`Carpeta de uploads detectada en: ${UPLOADS_PATH}`);
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
    logger.log(`Servidor iniciado en puerto ${PORT} | VERSION: 2.1.0-RESILIENT-INIT`);

    // Test and Init DB
    const db = require('./config/db');
    try {
        await db.query('SELECT 1');
        logger.log(`[DB] Conexión exitosa a ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);

        // Auto-initialize tables
        const schemaPath = path.resolve(__dirname, '../../schema.sql');
        if (fs.existsSync(schemaPath)) {
            let schema = fs.readFileSync(schemaPath, 'utf8');

            const statements = schema
                .replace(/^DELIMITER.*$/gm, '')
                .replace(/\/\//g, ';')
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const statement of statements) {
                try {
                    await db.query(statement);
                } catch (err) {
                    if (err.message.includes('already exists') || err.message.includes('Table already exists')) {
                        // ignore
                    } else if (err.message.includes('SUPER privilege')) {
                        logger.log(`[DB WARNING] Trigger skipped (no SUPER privilege). Backend logic will handle it.`);
                    } else {
                        logger.error(`[DB SCHEMA ERROR] Failed statement: ${statement.substring(0, 50)}...`, err);
                    }
                }
            }
            logger.log('[DB] Inicialización de esquema finalizada.');
        }
    } catch (err) {
        logger.error(`[DB ERROR] No se pudo conectar a la base de datos`, err);
    }
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});
