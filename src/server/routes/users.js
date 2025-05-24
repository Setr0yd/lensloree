const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db/db'); // Исправленный путь

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const db = readDB();
    const newUser = {
      id: Date.now(),
      ...req.body
    };
    db.users.push(newUser);
    writeDB(db);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Логин
router.post('/login', async (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.email === req.body.email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;