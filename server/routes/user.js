const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Training = require('../models/Training');
const { protect } = require('../middleware/auth');
const FreeAccess = require('../models/FreeAccess');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(protect);

// Получение настроек тренажёра пользователя
router.get('/trainer-settings', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        settings: user.trainerSettings
      }
    });
  } catch (error) {
    console.error('Get trainer settings error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при получении настроек тренажёра'
      }
    });
  }
});

// Обновление настроек тренажёра
router.put('/trainer-settings', [
  body('numbersCount')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Количество чисел должно быть от 1 до 10'),
  body('numberRange')
    .optional()
    .isIn([1, 10, 100, 1000, 10000])
    .withMessage('Неверный диапазон чисел'),
  body('operations')
    .optional()
    .isArray()
    .withMessage('Операции должны быть массивом'),
  body('operations.*')
    .isIn(['+', '-', '*', '/'])
    .withMessage('Недопустимая операция'),
  body('displaySpeed')
    .optional()
    .isInt({ min: 100, max: 10000 })
    .withMessage('Скорость отображения должна быть от 100 до 10000 мс'),
  body('displayMode')
    .optional()
    .isIn(['digits', 'abacus'])
    .withMessage('Режим отображения должен быть digits или abacus'),
  body('soundEnabled')
    .optional()
    .isBoolean()
    .withMessage('soundEnabled должен быть булевым значением'),
  body('voiceInput')
    .optional()
    .isBoolean()
    .withMessage('voiceInput должен быть булевым значением'),
  body('showAnswer')
    .optional()
    .isBoolean()
    .withMessage('showAnswer должен быть булевым значением'),
  body('progressiveMode')
    .optional()
    .isBoolean()
    .withMessage('progressiveMode должен быть булевым значением'),
  body('randomPosition')
    .optional()
    .isBoolean()
    .withMessage('randomPosition должен быть булевым значением'),
  body('randomColor')
    .optional()
    .isBoolean()
    .withMessage('randomColor должен быть булевым значением'),
  body('randomFont')
    .optional()
    .isBoolean()
    .withMessage('randomFont должен быть булевым значением')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Ошибки валидации',
          details: errors.array()
        }
      });
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      updates[`trainerSettings.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Настройки тренажёра обновлены',
      data: {
        settings: user.trainerSettings
      }
    });
  } catch (error) {
    console.error('Update trainer settings error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при обновлении настроек тренажёра'
      }
    });
  }
});

// Получение статистики пользователя
router.get('/stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    // Получаем общую статистику из Training
    const trainingStats = await Training.getUserStats(req.user._id, period);
    
    // Получаем статистику из профиля пользователя
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        profile: user.stats,
        training: trainingStats,
        achievements: user.achievements
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при получении статистики'
      }
    });
  }
});

// Получение прогресса пользователя за период
router.get('/progress', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const progress = await Training.getUserProgress(req.user._id, parseInt(days));
    
    res.json({
      success: true,
      data: {
        progress
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при получении прогресса'
      }
    });
  }
});

// Получение истории тренировок
router.get('/training-history', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };
    
    const trainings = await Training.find({ 
      userId: req.user._id, 
      completed: true 
    }, null, options);
    
    const total = await Training.countDocuments({ 
      userId: req.user._id, 
      completed: true 
    });
    
    res.json({
      success: true,
      data: {
        trainings,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: trainings.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get training history error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при получении истории тренировок'
      }
    });
  }
});

// Добавление достижения
router.post('/achievements', [
  body('id')
    .notEmpty()
    .withMessage('ID достижения обязателен'),
  body('name')
    .notEmpty()
    .withMessage('Название достижения обязательно'),
  body('description')
    .notEmpty()
    .withMessage('Описание достижения обязательно'),
  body('icon')
    .optional()
    .isString()
    .withMessage('Иконка должна быть строкой')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Ошибки валидации',
          details: errors.array()
        }
      });
    }

    const { id, name, description, icon } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Проверяем, не получено ли уже это достижение
    const existingAchievement = user.achievements.find(ach => ach.id === id);
    if (existingAchievement) {
      return res.status(400).json({
        error: {
          message: 'Достижение уже получено'
        }
      });
    }
    
    // Добавляем достижение
    user.achievements.push({
      id,
      name,
      description,
      icon: icon || 'trophy',
      unlockedAt: new Date()
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Достижение добавлено',
      data: {
        achievement: user.achievements[user.achievements.length - 1]
      }
    });
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при добавлении достижения'
      }
    });
  }
});

// Обновление статистики пользователя
router.put('/stats', [
  body('totalExercises')
    .optional()
    .isInt({ min: 0 })
    .withMessage('totalExercises должен быть неотрицательным числом'),
  body('correctAnswers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('correctAnswers должен быть неотрицательным числом'),
  body('totalTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('totalTime должен быть неотрицательным числом'),
  body('currentStreak')
    .optional()
    .isInt({ min: 0 })
    .withMessage('currentStreak должен быть неотрицательным числом'),
  body('experiencePoints')
    .optional()
    .isInt({ min: 0 })
    .withMessage('experiencePoints должен быть неотрицательным числом')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Ошибки валидации',
          details: errors.array()
        }
      });
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      updates[`stats.${key}`] = req.body[key];
    });

    // Вычисляем уровень на основе опыта
    if (req.body.experiencePoints !== undefined) {
      const level = Math.floor(req.body.experiencePoints / 1000) + 1;
      updates['stats.level'] = level;
    }

    // Обновляем лучшую точность
    if (req.body.correctAnswers !== undefined && req.body.totalExercises !== undefined) {
      const accuracy = Math.round((req.body.correctAnswers / req.body.totalExercises) * 100);
      if (accuracy > req.user.stats.bestAccuracy) {
        updates['stats.bestAccuracy'] = accuracy;
      }
    }

    // Обновляем самую длинную серию
    if (req.body.currentStreak !== undefined && req.body.currentStreak > req.user.stats.longestStreak) {
      updates['stats.longestStreak'] = req.body.currentStreak;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Статистика обновлена',
      data: {
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при обновлении статистики'
      }
    });
  }
});

// Технический маршрут: определить IP клиента и статус в белом списке
router.get('/my-ip', async (req, res) => {
  const rawIp = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket?.remoteAddress || '').toString();
  const firstIp = rawIp.split(',')[0].trim();
  const ip = firstIp.replace('::ffff:', '');
  const whitelist = [...(process.env.FREE_ACCESS_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean), '217.15.57.145'];
  const whitelisted = ip && whitelist.includes(ip);
  res.json({ success: true, data: { ip, rawIp, whitelisted, whitelist } });
});

// Проверка/выдача бесплатного доступа к абакусу (по IP, 20 минут, один раз)
router.post('/free-abacus', async (req, res) => {
  try {
    const rawIp = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket?.remoteAddress || '').toString();
    const firstIp = rawIp.split(',')[0].trim();
    const ip = firstIp.replace('::ffff:', '');
    const whitelist = [...(process.env.FREE_ACCESS_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean), '217.15.57.145'];
    if (ip && whitelist.includes(ip)) {
      return res.json({ success: true, data: { allowed: true, reason: 'whitelist', ip } });
    }
    if (!ip) {
      return res.status(400).json({ success: false, error: { message: 'Не удалось определить IP' } });
    }

    const now = new Date();
    let record = await FreeAccess.findOne({ ip });

    // Если есть блокировка — доступ запрещен
    if (record && record.blocked) {
      return res.json({ success: true, data: { allowed: false, reason: 'blocked', ip } });
    }

    // Если записи нет — создаём 20 минут доступа
    if (!record) {
      const startedAt = now;
      const expiresAt = new Date(now.getTime() + 20 * 60 * 1000);
      record = await FreeAccess.create({ ip, startedAt, expiresAt });
      return res.json({ success: true, data: { allowed: true, expiresAt, ip } });
    }

    // Если доступ есть и не истёк — пускаем
    if (record.expiresAt > now) {
      return res.json({ success: true, data: { allowed: true, expiresAt: record.expiresAt, ip } });
    }

    // Если истёк — повторно бесплатно не разрешаем
    return res.json({ success: true, data: { allowed: false, reason: 'expired', ip } });
  } catch (error) {
    console.error('Free abacus access error:', error);
    res.status(500).json({ success: false, error: { message: 'Ошибка при проверке доступа' } });
  }
});

module.exports = router; 