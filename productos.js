const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/productos - Obtiene la lista completa de productos para el catálogo
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion, precio, categoria, imagen_url FROM productos ORDER BY categoria, nombre'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

module.exports = router;
