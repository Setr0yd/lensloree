const express = require('express');
const path = require('path');
const app = express();

// Правильные пути к роутам
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
<<<<<<< HEAD
=======
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');

>>>>>>> 73c3102 (Guss)

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Роуты
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
<<<<<<< HEAD
=======
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
>>>>>>> 73c3102 (Guss)

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Панель поставщика
app.get('/supplier', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/supplier-panel.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 Сервер запущен: http://localhost:${PORT}
  📦 API: http://localhost:${PORT}/api/products
  👤 Users: http://localhost:${PORT}/api/users
<<<<<<< HEAD
  `);
});
=======
  🔐 Auth: http://localhost:${PORT}/api/auth
  ` );
});
>>>>>>> 73c3102 (Guss)
