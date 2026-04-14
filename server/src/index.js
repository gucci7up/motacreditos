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
const UPLOADS_PATH = path.resolve(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(UPLOADS_PATH)) {
    fs.mkdirSync(UPLOADS_PATH, { recursive: true });
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
            const schema = fs.readFileSync(schemaPath, 'utf8');
            // Split schema by semicolon but handle the DELIMITER carefully
            // For a simple implementation, we'll try to execute the tables first
            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('DELIMITER'));

            for (let statement of statements) {
                try {
                    await db.query(statement);
                } catch (err) {
                    // Ignore errors if table already exists or if it's a complex trigger part we can't parse easily here
                    if (!err.message.includes('already exists') && !err.message.includes('trigger already exists')) {
                        console.warn(`[DB INIT WARNING] Error en statement: ${statement.substring(0, 50)}... -> ${err.message}`);
                    }
                }
            }
            console.log('[DB] Inicialización de tablas completada.');
        }
    } catch (err) {
        console.error(`[DB ERROR] No se pudo conectar a la base de datos. Host: ${process.env.DB_HOST || 'localhost'}, Error: ${err.message}`);
    }
});
