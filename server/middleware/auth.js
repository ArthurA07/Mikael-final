const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Проверяем наличие токена в заголовке Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Проверяем наличие токена
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Доступ запрещён. Токен не предоставлен.'
        }
      });
    }

    try {
      // Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Получаем пользователя из базы данных
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Пользователь не найден. Токен недействителен.'
          }
        });
      }

      // Добавляем пользователя в объект запроса
      req.user = user;
      next();
    } catch (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({
        error: {
          message: 'Недействительный токен'
        }
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка сервера при проверке авторизации'
      }
    });
  }
};

// Middleware для проверки ролей (если потребуется в будущем)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Доступ запрещён'
        }
      });
    }

    if (!roles.includes(req.user.role || 'user')) {
      return res.status(403).json({
        error: {
          message: 'Недостаточно прав для выполнения этого действия'
        }
      });
    }

    next();
  };
};

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

module.exports = {
  protect,
  authorize,
  generateToken
}; 