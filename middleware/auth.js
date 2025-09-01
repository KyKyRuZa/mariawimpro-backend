const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Токен отсутствует' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!admin) {
      return res.status(401).json({ message: 'Неверный токен' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Ошибка аутентификации' });
  }
};

module.exports = auth;