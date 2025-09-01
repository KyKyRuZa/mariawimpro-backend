// controllers/tariffs.js
const Tariff = require('../models/tariffs');

// Получить все тарифы
exports.getAllTariffs = async (req, res) => {
  try {
    const tariffs = await Tariff.findAll({
      attributes: ['id', 'name', 'price', 'category', 'type', 'duration']
    });
    res.json(tariffs);
  } catch (error) {
    console.error('Ошибка получения тарифов:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении тарифов' });
  }
};

// Получить тарифы по категории
exports.getTariffsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const tariffs = await Tariff.findAll({
      where: { category },
      attributes: ['id', 'name', 'price', 'category', 'type', 'duration']
    });
    
    res.json(tariffs);
  } catch (error) {
    console.error('Ошибка получения тарифов:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении тарифов' });
  }
};

// Получить один тариф по ID
exports.getTariffById = async (req, res) => {
  try {
    const { id } = req.params;
    const tariff = await Tariff.findByPk(id, {
      attributes: ['id', 'name', 'price', 'category', 'type', 'duration']
    });
    
    if (!tariff) {
      return res.status(404).json({ error: 'Тариф не найден' });
    }
    
    res.json(tariff);
  } catch (error) {
    console.error('Ошибка получения тарифа:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении тарифа' });
  }
};

// Обновить цену тарифа
exports.updateTariffPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    
    // Валидация цены
    if (price === undefined || price === null) {
      return res.status(400).json({ error: 'Цена обязательна для заполнения' });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Цена должна быть положительным числом' });
    }
    
    const tariff = await Tariff.findByPk(id);
    if (!tariff) {
      return res.status(404).json({ error: 'Тариф не найден' });
    }
    
    // Обновляем только цену
    tariff.price = price;
    await tariff.save();
    
    res.json({
      message: 'Цена успешно обновлена',
      tariff: {
        id: tariff.id,
        name: tariff.name,
        price: tariff.price,
        category: tariff.category,
        type: tariff.type,
        duration: tariff.duration
      }
    });
  } catch (error) {
    console.error('Ошибка обновления цены:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновления цены' });
  }
};

// Обновить весь тариф
exports.updateTariff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, type, duration } = req.body;
    
    const tariff = await Tariff.findByPk(id);
    if (!tariff) {
      return res.status(404).json({ error: 'Тариф не найден' });
    }
    
    // Обновляем поля, если они переданы
    if (name !== undefined) tariff.name = name;
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Цена должна быть положительным числом' });
      }
      tariff.price = price;
    }
    if (category !== undefined) tariff.category = category;
    if (type !== undefined) tariff.type = type;
    if (duration !== undefined) tariff.duration = duration;
    
    await tariff.save();
    
    res.json({
      message: 'Тариф успешно обновлен',
      tariff: {
        id: tariff.id,
        name: tariff.name,
        price: tariff.price,
        category: tariff.category,
        type: tariff.type,
        duration: tariff.duration
      }
    });
  } catch (error) {
    console.error('Ошибка обновления тарифа:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении тарифа' });
  }
};

// Создать новый тариф
exports.createTariff = async (req, res) => {
  try {
    const { name, price, category, type, duration } = req.body;
    
    // Валидация
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название тарифа обязательно' });
    }
    
    if (price === undefined || price === null) {
      return res.status(400).json({ error: 'Цена обязательна' });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Цена должна быть положительным числом' });
    }
    
    if (!category) {
      return res.status(400).json({ error: 'Категория обязательна' });
    }
    
    if (!type) {
      return res.status(400).json({ error: 'Тип обязателен' });
    }
    
    if (!duration) {
      return res.status(400).json({ error: 'Длительность обязательна' });
    }
    
    const tariff = await Tariff.create({
      name: name.trim(),
      price: price,
      category: category,
      type: type,
      duration: duration
    });
    
    res.status(201).json({
      message: 'Тариф успешно создан',
      tariff: {
        id: tariff.id,
        name: tariff.name,
        price: tariff.price,
        category: tariff.category,
        type: tariff.type,
        duration: tariff.duration
      }
    });
  } catch (error) {
    console.error('Ошибка создания тарифа:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании тарифа' });
  }
};

// Удалить тариф
exports.deleteTariff = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tariff = await Tariff.findByPk(id);
    if (!tariff) {
      return res.status(404).json({ error: 'Тариф не найден' });
    }
    
    await tariff.destroy();
    
    res.json({ message: 'Тариф успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления тарифа:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении тарифа' });
  }
};