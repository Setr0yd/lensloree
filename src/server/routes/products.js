const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db/db');

// Получить все товары
router.get('/', (req, res) => {
  try {
    const db = readDB();
    res.json(db.products);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить конкретный товар
router.get('/:id', (req, res) => {
  try {
    const db = readDB();
    const product = db.products.find(p => p.id.toString() === req.params.id.toString());
    
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить товар
router.post('/', async (req, res) => {
  try {
    const db = readDB();
    const productData = { ...req.body };
    
    // Сохраняем URL изображений как есть, без скачивания
    const newProduct = {
      id: Date.now(),
      ...productData
    };
    
    db.products.push(newProduct);
    writeDB(db);
    
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Ошибка при добавлении товара:', err);
    res.status(500).json({ error: 'Ошибка при добавлении' });
  }
});

// Обновить товар
router.put('/:id', async (req, res) => {
  try {
    const db = readDB();
    const productId = req.params.id.toString();
    const productIndex = db.products.findIndex(p => p.id.toString() === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const productData = { ...req.body };
    
    // Сохраняем URL изображений как есть, без скачивания
    db.products[productIndex] = {
      ...db.products[productIndex],
      ...productData,
      id: db.products[productIndex].id // Сохраняем оригинальный ID
    };
    
    writeDB(db);
    res.json(db.products[productIndex]);
  } catch (err) {
    console.error('Ошибка при обновлении товара:', err);
    res.status(500).json({ error: 'Ошибка при обновлении' });
  }
});

// Удалить товар
router.delete('/:id', (req, res) => {
  try {
    const db = readDB();
    const productId = req.params.id.toString();
    db.products = db.products.filter(p => p.id.toString() !== productId);
    writeDB(db);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении' });
  }
});

module.exports = router;
