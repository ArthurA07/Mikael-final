const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Training = require('../models/Training');

const router = express.Router();

// Все админ-маршруты защищены и требуют роли admin
router.use(protect, authorize('admin'));

// Список пользователей с поиском и пагинацией
router.get('/users', async (req, res) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const filter = q
      ? {
          $or: [
            { email: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } },
          ],
        }
      : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password'),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: items.length,
          totalRecords: total,
        },
      },
    });
  } catch (e) {
    console.error('Admin list users error:', e);
    res.status(500).json({ error: { message: 'Ошибка получения списка пользователей' } });
  }
});

// Сброс пароля пользователю (установка временного пароля)
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body || {};
    const password = newPassword && String(newPassword).length >= 6 ? newPassword : 'Temp123!';
    const user = await User.findById(id).select('+password');
    if (!user) return res.status(404).json({ error: { message: 'Пользователь не найден' } });
    user.password = password;
    await user.save();
    res.json({ success: true, message: 'Пароль сброшен', data: { tempPassword: password } });
  } catch (e) {
    console.error('Admin reset password error:', e);
    res.status(500).json({ error: { message: 'Ошибка сброса пароля' } });
  }
});

// Экспорт истории одного пользователя в CSV (удобный путь)
router.get('/users/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    const q = { userId: id };
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }
    const rows = await Training.find(q).sort({ createdAt: 1 });
    const header = 'date,mode,operations,numbersCount,range,total,correct,accuracy,score\n';
    const body = rows
      .map((r) =>
        [
          new Date(r.createdAt).toISOString(),
          r.settings.displayMode,
          (r.settings.operations || []).join(''),
          r.settings.numbersCount,
          `1-${r.settings.numberRange}`,
          r.results.totalProblems,
          r.results.correctAnswers,
          r.results.accuracy,
          r.results.score,
        ].join(',')
      )
      .join('\n');
    const csv = header + body;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="history.csv"');
    res.status(200).send(csv);
  } catch (e) {
    console.error('Admin export error:', e);
    res.status(500).json({ error: { message: 'Ошибка экспорта' } });
  }
});

module.exports = router;


