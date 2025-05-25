const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db/db');

// Middleware для проверки авторизации
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  try {
    // Проверка токена и получение данных пользователя
    const db = readDB();
    const user = db.users.find(u => u.id.toString() === token);
    
    if (!user) {
      return res.status(401).json({ error: 'Недействительный токен' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Ошибка авторизации' });
  }
};

// Получить корзину текущего пользователя
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = readDB();
    
    // Проверяем, существует ли массив корзин
    if (!db.carts) {
      db.carts = [];
    }
    
    // Ищем корзину пользователя
    const userCart = db.carts.find(cart => cart.userId === req.user.id);
    
    if (!userCart) {
      // Если корзины нет, возвращаем пустую
      return res.json({ items: [] });
    }
    
    res.json({ items: userCart.items });
  } catch (err) {
    console.error('Ошибка получения корзины:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить товар в корзину
router.post('/add', authMiddleware, (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Не указан ID товара' });
    }
    
    const db = readDB();
    
    // Проверяем, существует ли товар
    const product = db.products.find(p => p.id.toString() === productId.toString());
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    // Проверяем, существует ли массив корзин
    if (!db.carts) {
      db.carts = [];
    }
    
    // Ищем корзину пользователя
    let userCart = db.carts.find(cart => cart.userId === req.user.id);
    
    if (!userCart) {
      // Если корзины нет, создаем новую
      userCart = {
        userId: req.user.id,
        items: [],
        updatedAt: new Date().toISOString()
      };
      db.carts.push(userCart);
    }
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItemIndex = userCart.items.findIndex(item => item.productId.toString() === productId.toString());
    
    if (existingItemIndex !== -1) {
      // Если товар уже есть, увеличиваем количество
      userCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Если товара нет, добавляем новый
      userCart.items.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }
    
    // Обновляем время последнего изменения
    userCart.updatedAt = new Date().toISOString();
    
    // Сохраняем изменения
    writeDB(db);
    
    res.json({ success: true, items: userCart.items });
  } catch (err) {
    console.error('Ошибка добавления товара в корзину:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить количество товара в корзине
router.put('/update', authMiddleware, (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Не указан ID товара' });
    }
    
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'Некорректное количество' });
    }
    
    const db = readDB();
    
    // Проверяем, существует ли массив корзин
    if (!db.carts) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }
    
    // Ищем корзину пользователя
    const userCartIndex = db.carts.findIndex(cart => cart.userId === req.user.id);
    
    if (userCartIndex === -1) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }
    
    // Ищем товар в корзине
    const itemIndex = db.carts[userCartIndex].items.findIndex(item => item.productId.toString() === productId.toString());
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Товар не найден в корзине' });
    }
    
    if (quantity === 0) {
      // Если количество 0, удаляем товар из корзины
      db.carts[userCartIndex].items.splice(itemIndex, 1);
    } else {
      // Иначе обновляем количество
      db.carts[userCartIndex].items[itemIndex].quantity = quantity;
    }
    
    // Обновляем время последнего изменения
    db.carts[userCartIndex].updatedAt = new Date().toISOString();
    
    // Сохраняем изменения
    writeDB(db);
    
    res.json({ success: true, items: db.carts[userCartIndex].items });
  } catch (err) {
    console.error('Ошибка обновления товара в корзине:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить товар из корзины
router.delete('/remove/:productId', authMiddleware, (req, res) => {
  try {
    const { productId } = req.params;
    
    const db = readDB();
    
    // Проверяем, существует ли массив корзин
    if (!db.carts) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }
    
    // Ищем корзину пользователя
    const userCartIndex = db.carts.findIndex(cart => cart.userId === req.user.id);
    
    if (userCartIndex === -1) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }
    
    // Удаляем товар из корзины
    db.carts[userCartIndex].items = db.carts[userCartIndex].items.filter(
      item => item.productId.toString() !== productId.toString()
    );
    
    // Обновляем время последнего изменения
    db.carts[userCartIndex].updatedAt = new Date().toISOString();
    
    // Сохраняем изменения
    writeDB(db);
    
    res.json({ success: true, items: db.carts[userCartIndex].items });
  } catch (err) {
    console.error('Ошибка удаления товара из корзины:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Очистить корзину
router.delete('/clear', authMiddleware, (req, res) => {
  try {
    const db = readDB();
    
    // Проверяем, существует ли массив корзин
    if (!db.carts) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }
    
    // Ищем корзину пользователя
    const userCartIndex = db.carts.findIndex(cart => cart.userId === req.user.id);
    
    if (userCartIndex === -1) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }
    
    // Очищаем корзину
    db.carts[userCartIndex].items = [];
    
    // Обновляем время последнего изменения
    db.carts[userCartIndex].updatedAt = new Date().toISOString();
    
    // Сохраняем изменения
    writeDB(db);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка очистки корзины:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить всю корзину
router.put('/', authMiddleware, (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Некорректный формат данных' });
    }
    
    const db = readDB();
    
    // Проверяем, существует ли массив корзин
    if (!db.carts) {
      db.carts = [];
    }
    
    // Ищем корзину пользователя
    let userCartIndex = db.carts.findIndex(cart => cart.userId === req.user.id);
    
    if (userCartIndex === -1) {
      // Если корзины нет, создаем новую
      db.carts.push({
        userId: req.user.id,
        items: [],
        updatedAt: new Date().toISOString()
      });
      userCartIndex = db.carts.length - 1;
    }
    
    // Обновляем корзину
    db.carts[userCartIndex].items = items;
    db.carts[userCartIndex].updatedAt = new Date().toISOString();
    
    // Сохраняем изменения
    writeDB(db);
    
    res.json({ success: true, items: db.carts[userCartIndex].items });
  } catch (err) {
    console.error('Ошибка обновления корзины:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
