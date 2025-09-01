const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Проверка существующего пользователя
    const existingAdmin = await Admin.findOne({ where: { login } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Создание нового администратора
    const admin = await Admin.create({ login, password });

    // Генерация токена
    const token = generateToken(admin.id);

    res.status(201).json({
      token,
      admin: {
        id: admin.id,
        login: admin.login
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Поиск пользователя
    const admin = await Admin.findOne({ where: { login } });
    if (!admin || !(await admin.correctPassword(password))) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Генерация токена
    const token = generateToken(admin.id);

    res.json({
      token,
      admin: {
        id: admin.id,
        login: admin.login
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};