const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

// Mock database
const users = [];

// Проверка почты
app.post('/api/auth/check-email', (req, res) => {
  const { email } = req.body;
  const exists = users.some(user => user.email === email);
  res.json({ exists });
});

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Проверка существования пользователя
  if (users.some(user => user.email === email)) {
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

    users.push(user);
    
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
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});