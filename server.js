require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const productosRouter = require('./routes/productos');
const pedidosRouter = require('./routes/pedidos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir el frontend estático (HTML/CSS/JS) directamente desde Express
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rutas de la API REST
app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', mensaje: 'API de pedidos funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
