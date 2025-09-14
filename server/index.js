const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const trainingRoutes = require('./routes/training');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const User = require('./models/User');

const app = express();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins, credentials: true } : {}));
app.use(express.json({ limit: '10mb' }));
// Helmet + CSP (безопасные дефолты; доп. источники можно задать через env CSP_CONNECT_SRC="https://mikael-final.onrender.com")
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", 'data:', 'blob:'],
      "connect-src": ["'self'", ...((process.env.CSP_CONNECT_SRC || 'https:').split(',').map(s => s.trim()).filter(Boolean))],
      "object-src": ["'none'"],
      "frame-ancestors": ["'none'"],
      "upgrade-insecure-requests": [],
    },
  } : undefined,
}));
app.use(mongoSanitize());
app.use(xss());
// Request ID для логов
morgan.token('rid', (req) => req.id || '-');
app.use((req, res, next) => { try { req.id = require('crypto').randomUUID(); } catch {} next(); });
app.use(morgan(process.env.NODE_ENV !== 'production' ? ':rid :method :url :status :response-time ms' : ':rid :method :url :status :response-time ms'));

// Staging noindex header to prevent accidental indexing
app.use((req, res, next) => {
  if (process.env.STAGING === 'true') {
    res.set('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
const forgotLimiter = rateLimit({ windowMs: 60 * 1000, max: 3 });
app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/forgot-password', forgotLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mental Arithmetic Trainer API is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: {
      message: error.message || 'Внутренняя ошибка сервера'
    }
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));
  // Override robots.txt on staging to disallow all crawlers
  app.get('/robots.txt', (req, res, next) => {
    if (process.env.STAGING === 'true') {
      res.type('text/plain').send('User-agent: *\nDisallow: /');
      return;
    }
    next();
  });
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 404 handler for API only
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: { message: 'Маршрут не найден' } });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-arithmetic';

async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    let admin = await User.findOne({ email });
    if (!admin) {
      admin = await User.create({ name: 'Admin', email, password, role: 'admin' });
      console.log(`Admin user created: ${email}`);
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log(`User elevated to admin: ${email}`);
    } else {
      console.log('Admin user exists');
    }
  } catch (e) {
    console.warn('Admin seed warning:', e?.message || e);
  }
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Подключение к MongoDB успешно установлено');
    await seedAdmin();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });

module.exports = app; 