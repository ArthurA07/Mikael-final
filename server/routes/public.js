const express = require('express');
const jwt = require('jsonwebtoken');
const FreeAccess = require('../models/FreeAccess');
const User = require('../models/User');

const router = express.Router();

// Публичная проверка бесплатного доступа по IP (20 минут с момента первого визита)
// Если передан валидный токен авторизованного пользователя — доступ всегда разрешён
router.post('/free-access', async (req, res) => {
  try {
    // Пытаемся распознать пользователя по токену, если он есть
    const authHeader = (req.headers.authorization || '').toString();
    if (authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          return res.json({ success: true, data: { allowed: true, reason: 'authenticated' } });
        }
      } catch (e) {
        // игнорируем — просто считаем гостем
      }
    }

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

    if (record && record.blocked) {
      return res.json({ success: true, data: { allowed: false, reason: 'blocked', ip } });
    }

    if (!record) {
      const startedAt = now;
      const expiresAt = new Date(now.getTime() + 20 * 60 * 1000);
      record = await FreeAccess.create({ ip, startedAt, expiresAt });
      return res.json({ success: true, data: { allowed: true, expiresAt, ip } });
    }

    if (record.expiresAt > now) {
      return res.json({ success: true, data: { allowed: true, expiresAt: record.expiresAt, ip } });
    }

    return res.json({ success: true, data: { allowed: false, reason: 'expired', ip } });
  } catch (error) {
    console.error('Public free access error:', error);
    res.status(500).json({ success: false, error: { message: 'Ошибка при проверке доступа' } });
  }
});

module.exports = router;


