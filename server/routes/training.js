const express = require('express');
const { body, validationResult } = require('express-validator');
const Training = require('../models/Training');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(protect);

// Генерация случайного числа в диапазоне
const generateRandomNumber = (range) => {
  if (range === 1) return Math.floor(Math.random() * 9) + 1; // 1-9
  return Math.floor(Math.random() * range);
};

// Генерация примера
const generateProblem = (settings) => {
  const { numbersCount, numberRange, operations } = settings;
  const numbers = [];
  
  // Генерируем числа
  for (let i = 0; i < numbersCount; i++) {
    numbers.push(generateRandomNumber(numberRange));
  }
  
  // Выбираем случайную операцию
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  // Вычисляем правильный ответ
  let correctAnswer = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    switch (operation) {
      case '+':
        correctAnswer += numbers[i];
        break;
      case '-':
        correctAnswer -= numbers[i];
        break;
      case '*':
        correctAnswer *= numbers[i];
        break;
      case '/':
        if (numbers[i] !== 0) {
          correctAnswer = Math.round(correctAnswer / numbers[i]);
        }
        break;
    }
  }
  
  return {
    numbers,
    operation,
    correctAnswer,
    difficulty: Math.ceil(Math.log10(numberRange)) + (numbersCount - 1) * 0.5
  };
};

// Создание новой тренировочной сессии
router.post('/start', async (req, res) => {
  try {
    const { settings, sessionType = 'practice' } = req.body;

    const training = new Training({
      userId: req.user._id,
      settings,
      sessionType,
      problems: [],
      results: {
        totalProblems: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        totalTime: 0,
        averageTime: 0,
        score: 0
      },
      completed: false
    });

    await training.save();

    res.status(201).json({
      success: true,
      message: 'Тренировочная сессия создана',
      data: {
        trainingId: training._id,
        settings: training.settings
      }
    });
  } catch (error) {
    console.error('Start training error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при создании тренировочной сессии'
      }
    });
  }
});

// Получение нового примера
router.get('/:trainingId/problem', async (req, res) => {
  try {
    const { trainingId } = req.params;
    
    const training = await Training.findOne({
      _id: trainingId,
      userId: req.user._id,
      completed: false
    });
    
    if (!training) {
      return res.status(404).json({
        error: {
          message: 'Тренировочная сессия не найдена или завершена'
        }
      });
    }

    const problem = generateProblem(training.settings);

    res.json({
      success: true,
      data: {
        problem: {
          numbers: problem.numbers,
          operation: problem.operation,
          difficulty: problem.difficulty
        }
      }
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      error: {
        message: 'Ошибка при генерации примера'
      }
    });
  }
});

// Завершение сессии и сохранение результатов
router.post('/complete', [
  body('problems').isArray().withMessage('problems должен быть массивом'),
  body('settings').isObject().withMessage('settings обязателен'),
  body('metrics').isObject().withMessage('metrics обязателен'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Ошибки валидации', details: errors.array() } });
    }

    const { problems, settings, metrics, sessionType = 'practice' } = req.body;

    const training = new Training({
      userId: req.user._id,
      settings: {
        numbersCount: settings.numbersCount,
        numberRange: settings.numberRange,
        operations: settings.operations,
        displaySpeed: settings.displaySpeed,
        displayMode: settings.displayMode,
        progressiveMode: settings.progressiveMode || false,
      },
      problems: problems.map((p) => ({
        numbers: p.numbers,
        operation: p.operation,
        correctAnswer: p.correctAnswer,
        userAnswer: p.userAnswer ?? null,
        isCorrect: !!p.isCorrect,
        timeSpent: p.timeSpent || 0,
        difficulty: p.difficulty || 1,
      })),
      results: {
        totalProblems: 0, // вычислится в pre('save')
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        totalTime: metrics.totalTime || 0,
        averageTime: 0,
        score: 0,
      },
      sessionType,
      completed: true,
      completedAt: new Date(),
    });

    await training.save();

    res.json({ success: true, data: { trainingId: training._id } });
  } catch (error) {
    console.error('Complete training error:', error);
    res.status(500).json({ error: { message: 'Ошибка при сохранении результатов' } });
  }
});

module.exports = router; 