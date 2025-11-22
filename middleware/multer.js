const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = '/var/www/assets';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неверный тип файла. Разрешены только JPEG, PNG, WebP, GIF.'), false);
  }
};

// Настройка Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    fieldNameSize: 100, // Максимальный размер имени поля
    fieldSize: 10 * 1024 * 1024, // Максимальный размер значения поля
  }
});

// Middleware для обработки ошибок Multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'Файл слишком большой. Максимальный размер: 10MB'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Неожиданное поле с файлом'
      });
    }
  }
  
  if (error.message.includes('Неверный тип файла')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
};

module.exports = { upload, handleMulterError };