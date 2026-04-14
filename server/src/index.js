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
app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
