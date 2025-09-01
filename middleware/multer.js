const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем папку uploads, если она не существует
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища для Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'coach-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Неверный тип файла. Разрешены только изображения.'), false);
  }
};

// Настройка Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Ограничение размера файла до 5MB
  }
});

module.exports = upload;