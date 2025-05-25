const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { readDB, writeDB } = require('../db/db');

// Проверка почты
router.post('/check-email', (req, res) => {
  const { email } = req.body;
  const db = readDB();
  
  // Убедимся, что массив users существует
  if (!db.users) {
    db.users = [];
  }
  
  const exists = db.users.some(user => user.email === email);
  res.json({ exists });
});

// Регистрация
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const db = readDB();
  
  // Убедимся, что массив users существует
  if (!db.users) {
    db.users = [];
  }

  // Проверка существования пользователя
  if (db.users.some(user => user.email === email)) {
    return res.status(400).json({ message: 'Email уже зарегистрирован' });
  }

  try {
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      createdAt: new Date()
    };

    // Добавляем пользователя в базу данных
    db.users.push(user);
    writeDB(db);
    
    // Создание JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'your_secret_key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Пользователь создан',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  
  // Убедимся, что массив users существует
  if (!db.users) {
    db.users = [];
  }
  
  // Поиск пользователя
  const user = db.users.find(user => user.email === email);
  
  if (!user) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }
  
  try {
    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    // Создание JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'your_secret_key',
      { expiresIn: '1h' }
    );
    
    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление аккаунта
router.delete('/delete-account', (req, res) => {
  try {
    // Проверка авторизации
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }
    
    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, 'your_secret_key');
    } catch (error) {
      return res.status(401).json({ message: 'Недействительный токен' });
    }
    
    const { userId } = req.body;
    
    // Проверка, что пользователь удаляет свой аккаунт
    if (decoded.userId !== userId) {
      return res.status(403).json({ message: 'Нет прав для удаления этого аккаунта' });
    }
    
    const db = readDB();
    
    // Убедимся, что массив users существует
    if (!db.users) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Поиск индекса пользователя
    const userIndex = db.users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Удаление пользователя
    db.users.splice(userIndex, 1);
    writeDB(db);
    
    res.json({ message: 'Аккаунт успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления аккаунта:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавляем GET-маршрут для корневого пути
router.get('/', (req, res) => {
  res.json({ message: 'API аутентификации работает. Доступные маршруты: /register, /login, /check-email, /delete-account' });
});

module.exports = router;
