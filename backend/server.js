// ============================================
// Сервер для ARUNDO - Карта водойм та риб
// ============================================

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dns = require('dns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// ─── Cloudinary ──────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const waterStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'arundo/water',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const fishStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'arundo/fish',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }],
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'arundo/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
  },
});

const uploadWater  = multer({ storage: waterStorage,  limits: { fileSize: 10 * 1024 * 1024 } });
const uploadFish   = multer({ storage: fishStorage,   limits: { fileSize:  5 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize:  2 * 1024 * 1024 } });

// ─── Middleware ───────────────────────────────────────────────
// ВАЖЛИВО: express.json() з явним charset=utf-8 щоб кирилиця не ламалась
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

// UTF-8 заголовки для всіх відповідей
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── MongoDB ──────────────────────────────────────────────────
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('❌ MONGODB_URI не знайдено!'); process.exit(1); }

// Явно передаємо utf8 у опціях підключення
const client = new MongoClient(uri, {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
});
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('arundo');

    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('waterbodies').createIndex({ location: '2dsphere' });

    // ── Виправлення зіпсованого кодування в існуючих користувачах ──
    await fixEncodingInDB();

    // ── Seed water types ──
    const wtCount = await db.collection('watertypes').countDocuments();
    if (wtCount === 0) {
      await db.collection('watertypes').insertMany([
        { name: 'Річка',        emoji: '🌊', description: 'Проточна водойма',            order: 1, createdAt: new Date().toISOString() },
        { name: 'Озеро',        emoji: '🏞️', description: 'Стояча природна водойма',     order: 2, createdAt: new Date().toISOString() },
        { name: 'Ставок',       emoji: '💧', description: 'Невелика штучна водойма',     order: 3, createdAt: new Date().toISOString() },
        { name: 'Водосховище',  emoji: '🏔️', description: 'Штучне велике водосховище',  order: 4, createdAt: new Date().toISOString() },
        { name: 'Платна',       emoji: '🎣', description: 'Платна рибальська водойма',   order: 5, createdAt: new Date().toISOString() },
        { name: 'Канал',        emoji: '〰️', description: 'Штучний канал',              order: 6, createdAt: new Date().toISOString() },
      ]);
      console.log('✅ Seeded water types');
    }

    // ── Seed filter fish ──
    const ffCount = await db.collection('filterfish').countDocuments();
    if (ffCount === 0) {
      await db.collection('filterfish').insertMany([
        { name: 'Короп',  emoji: '🐟', order: 1, createdAt: new Date().toISOString() },
        { name: 'Карась', emoji: '🐠', order: 2, createdAt: new Date().toISOString() },
        { name: 'Щука',   emoji: '🦈', order: 3, createdAt: new Date().toISOString() },
        { name: 'Окунь',  emoji: '🐡', order: 4, createdAt: new Date().toISOString() },
        { name: 'Форель', emoji: '🐟', order: 5, createdAt: new Date().toISOString() },
        { name: 'Лящ',    emoji: '🐟', order: 6, createdAt: new Date().toISOString() },
      ]);
      console.log('✅ Seeded filter fish');
    }

    console.log('✅ Підключено до MongoDB Atlas — arundo');
  } catch (err) {
    console.error('❌ MongoDB:', err.message);
    process.exit(1);
  }
}

// ─── Виправлення зіпсованого кодування (latin1 → utf8) ───────
async function fixEncodingInDB() {
  try {
    const users = await db.collection('users').find({}).toArray();
    let fixed = 0;
    for (const u of users) {
      const fields = {};

      if (u.name) {
        const fixedName = tryFixEncoding(u.name);
        if (fixedName !== u.name) fields.name = fixedName;
      }

      if (Object.keys(fields).length > 0) {
        await db.collection('users').updateOne(
          { _id: u._id },
          { $set: { ...fields, updatedAt: new Date().toISOString() } }
        );
        fixed++;
        console.log(`🔧 Fixed encoding for user: ${u._id}`);
      }
    }
    if (fixed > 0) console.log(`✅ Fixed encoding for ${fixed} users`);
  } catch (err) {
    console.warn('⚠️ Could not fix encoding:', err.message);
  }
}

// Спроба виправити кодування latin1 → utf8
function tryFixEncoding(str) {
  if (!str || typeof str !== 'string') return str;
  try {
    // Перевіряємо чи є зіпсовані символи (типові для latin1/cp1252 замість utf8)
    if (/[\xC0-\xFF][\x80-\xBF]/.test(str) || str.includes('Ð') || str.includes('â')) {
      const fixed = Buffer.from(str, 'latin1').toString('utf8');
      // Перевіряємо що виправлення дало сенс (є кирилиця або звичайні символи)
      if (/[\u0400-\u04FF\u0020-\u007E]/.test(fixed)) {
        return fixed;
      }
    }
  } catch (_) {}
  return str;
}

// ─── Auth middleware ──────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Необхідна авторизація' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Невалідний або прострочений токен' }); }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ error: 'Доступ заборонено' });
    next();
  };
}

function parseJsonField(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); }
  catch { return fallback; }
}

// ============================================================
//  AUTH
// ============================================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Заповніть усі поля' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Пароль мінімум 6 символів' });

    const count = await db.collection('users').countDocuments();
    const role  = count === 0 ? 'admin' : 'user';
    const passwordHash = await bcrypt.hash(password, 12);

    // Явно зберігаємо ім'я як рядок utf8
    const cleanName = String(name).trim();

    const result = await db.collection('users').insertOne({
      name: cleanName,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      avatarUrl: null,
      favoriteWaters: [],
      createdAt: new Date().toISOString(),
    });

    const token = jwt.sign(
      { userId: result.insertedId.toString(), email: email.toLowerCase().trim(), name: cleanName, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        name: cleanName,
        email: email.toLowerCase().trim(),
        role,
        avatarUrl: null,
        favoriteWaters: [],
      }
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: 'Email вже зареєстровано' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Введіть email та пароль' });

    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Невірний email або пароль' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Невірний email або пароль' });

    // Виправляємо кодування при логіні (на випадок старих записів)
    const fixedName = tryFixEncoding(user.name);

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: fixedName, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: fixedName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || null,
        favoriteWaters: user.favoriteWaters || [],
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });

    const fixedName = tryFixEncoding(user.name);

    res.json({
      id: user._id.toString(),
      name: fixedName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || null,
      favoriteWaters: user.favoriteWaters || [],
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
//  USERS - PROFILE
// ============================================================

// Оновити профіль (ім'я та прізвище)
app.put('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Ім'я обов'язкове" });
    }

    // Явно зберігаємо як utf8 рядок
    const cleanName = String(name).trim();

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $set: { name: cleanName, updatedAt: new Date().toISOString() } }
    );

    const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });

    res.json({
      message: 'Профіль оновлено',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl || null,
        favoriteWaters: updatedUser.favoriteWaters || [],
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Завантажити аватар
app.post('/api/users/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }

    const avatarUrl = req.file.path;

    // Видаляємо старий аватар з Cloudinary
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    if (user?.avatarPublicId) {
      try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch (_) {}
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      {
        $set: {
          avatarUrl,
          avatarPublicId: req.file.filename,
          updatedAt: new Date().toISOString(),
        }
      }
    );

    res.json({ avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Отримати улюблені водойми
app.get('/api/users/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });
    res.json({ favorites: user.favoriteWaters || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Оновити улюблені водойми (повна заміна масиву)
app.put('/api/users/favorites', authMiddleware, async (req, res) => {
  try {
    const { favorites } = req.body;
    if (!Array.isArray(favorites)) {
      return res.status(400).json({ error: 'favorites має бути масивом' });
    }

    // Перевіряємо що всі ID є рядками
    const cleanFavorites = favorites.filter(id => typeof id === 'string' && id.trim());

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $set: { favoriteWaters: cleanFavorites, updatedAt: new Date().toISOString() } }
    );

    res.json({ message: 'Улюблені водойми оновлено', favorites: cleanFavorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Додати одну водойму до улюблених
app.post('/api/users/favorites/:waterId', authMiddleware, async (req, res) => {
  try {
    const { waterId } = req.params;

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      {
        $addToSet: { favoriteWaters: waterId },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    res.json({ message: 'Додано до улюблених', favorites: user.favoriteWaters || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Видалити одну водойму з улюблених
app.delete('/api/users/favorites/:waterId', authMiddleware, async (req, res) => {
  try {
    const { waterId } = req.params;

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      {
        $pull: { favoriteWaters: waterId },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    res.json({ message: 'Видалено з улюблених', favorites: user.favoriteWaters || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  FILTERS — WATER TYPES
// ============================================================
app.get('/api/filters/water-types', async (req, res) => {
  try {
    const types = await db.collection('watertypes').find().sort({ order: 1 }).toArray();
    res.json(types.map(t => ({
      _id: t._id.toString(),
      name: t.name,
      emoji: t.emoji || '',
      description: t.description || '',
      order: t.order,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/filters/water-types', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, emoji, description } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Назва типу обов'язкова" });

    const count = await db.collection('watertypes').countDocuments();
    const doc = {
      name: name.trim(),
      emoji: emoji || '',
      description: description || '',
      order: count + 1,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection('watertypes').insertOne(doc);
    res.status(201).json({ _id: result.insertedId.toString(), ...doc });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/filters/water-types/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, emoji, description } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Назва обов'язкова" });

    const update = {
      name: name.trim(),
      emoji: emoji || '',
      description: description || '',
      updatedAt: new Date().toISOString(),
    };
    const result = await db.collection('watertypes').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    if (result.matchedCount === 0)
      return res.status(404).json({ error: 'Тип не знайдено' });
    res.json({ message: 'Тип оновлено', _id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/filters/water-types/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.collection('watertypes').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: 'Тип не знайдено' });
    res.json({ message: 'Тип видалено', _id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
//  FILTERS — FISH
// ============================================================
app.get('/api/filters/fish', async (req, res) => {
  try {
    const fish = await db.collection('filterfish').find().sort({ order: 1 }).toArray();
    res.json(fish.map(f => ({
      _id: f._id.toString(),
      name: f.name,
      emoji: f.emoji || '',
      order: f.order,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/filters/fish', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, emoji } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Назва риби обов'язкова" });

    const count = await db.collection('filterfish').countDocuments();
    const doc = {
      name: name.trim(),
      emoji: emoji || '',
      order: count + 1,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection('filterfish').insertOne(doc);
    res.status(201).json({ _id: result.insertedId.toString(), ...doc });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/filters/fish/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, emoji } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Назва обов'язкова" });

    const update = {
      name: name.trim(),
      emoji: emoji || '',
      updatedAt: new Date().toISOString(),
    };
    const result = await db.collection('filterfish').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    if (result.matchedCount === 0)
      return res.status(404).json({ error: 'Рибу не знайдено' });
    res.json({ message: 'Оновлено', _id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/filters/fish/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const result = await db.collection('filterfish').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: 'Рибу не знайдено' });
    res.json({ message: 'Видалено', _id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
//  WATER BODIES
// ============================================================
function formatWater(w) {
  return {
    _id: w._id.toString(),
    name: w.name,
    location: w.location,
    description: w.description || '',
    images: w.images || [],
    fishSpecies: w.fishSpecies || [],
    dominantFish: w.dominantFish || [],
    bestSeasons: w.bestSeasons || [],
    waterType: w.waterType || '',
    createdAt: w.createdAt,
  };
}

app.get('/api/water', async (req, res) => {
  try {
    const filter = {};
    if (req.query.waterType)    filter.waterType    = req.query.waterType;
    if (req.query.season)       filter.bestSeasons  = req.query.season;
    if (req.query.dominantFish) filter.dominantFish = req.query.dominantFish;
    const water = await db.collection('waterbodies').find(filter).toArray();
    res.json(water.map(formatWater));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/water/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query;
    if (!lat || !lng)
      return res.status(400).json({ error: 'Вкажіть lat та lng' });
    const water = await db.collection('waterbodies').find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    }).toArray();
    res.json(water.map(formatWater));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/water/:id', async (req, res) => {
  try {
    const water = await db.collection('waterbodies').findOne({ _id: new ObjectId(req.params.id) });
    if (!water) return res.status(404).json({ error: 'Водойму не знайдено' });
    res.json(formatWater(water));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/water', authMiddleware, requireRole('admin'), uploadWater.array('images', 10), async (req, res) => {
  try {
    const { name, lat, lng, description, waterType, fishSpecies, dominantFish, bestSeasons } = req.body;
    if (!name || !lat || !lng)
      return res.status(400).json({ error: "Назва та координати обов'язкові" });

    const images = (req.files || []).map(f => ({ url: f.path, publicId: f.filename }));
    const doc = {
      name: String(name).trim(),
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      description: description || '',
      images,
      fishSpecies: parseJsonField(fishSpecies),
      dominantFish: parseJsonField(dominantFish),
      bestSeasons: parseJsonField(bestSeasons),
      waterType: waterType || '',
      createdBy: req.user.userId,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection('waterbodies').insertOne(doc);
    res.status(201).json({ message: 'Водойму додано', ...formatWater({ ...doc, _id: result.insertedId }) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/water/:id', authMiddleware, requireRole('admin'), uploadWater.array('images', 10), async (req, res) => {
  try {
    const { name, lat, lng, description, waterType, fishSpecies, dominantFish, bestSeasons, removeImages } = req.body;
    const existing = await db.collection('waterbodies').findOne({ _id: new ObjectId(req.params.id) });
    if (!existing) return res.status(404).json({ error: 'Водойму не знайдено' });

    let currentImages = existing.images || [];
    if (removeImages) {
      const toRemove = parseJsonField(removeImages, []);
      for (const publicId of toRemove) {
        try { await cloudinary.uploader.destroy(publicId); } catch (_) {}
      }
      currentImages = currentImages.filter(img => !toRemove.includes(img.publicId));
    }
    if (req.files && req.files.length > 0) {
      currentImages = [...currentImages, ...req.files.map(f => ({ url: f.path, publicId: f.filename }))];
    }

    const update = {
      name: String(name).trim(),
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      description: description || '',
      images: currentImages,
      fishSpecies: parseJsonField(fishSpecies),
      dominantFish: parseJsonField(dominantFish),
      bestSeasons: parseJsonField(bestSeasons),
      waterType: waterType || '',
      updatedAt: new Date().toISOString(),
    };
    await db.collection('waterbodies').updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.json({ message: 'Водойму оновлено', _id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/water/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const water = await db.collection('waterbodies').findOne({ _id: new ObjectId(req.params.id) });
    if (!water) return res.status(404).json({ error: 'Водойму не знайдено' });
    for (const img of water.images || []) {
      try { await cloudinary.uploader.destroy(img.publicId); } catch (_) {}
    }
    await db.collection('waterbodies').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Водойму видалено', _id: req.params.id, name: water.name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
//  FISH
// ============================================================
function formatFish(f) {
  return {
    _id: f._id.toString(),
    name: f.name,
    scientificName: f.scientificName || '',
    description: f.description || '',
    image: f.image || null,
    maxWeight: f.maxWeight ?? null,
    maxLength: f.maxLength ?? null,
  };
}

app.get('/api/fish', async (req, res) => {
  try {
    const fish = await db.collection('fish').find().toArray();
    res.json(fish.map(formatFish));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/fish/:id', async (req, res) => {
  try {
    const fish = await db.collection('fish').findOne({ _id: new ObjectId(req.params.id) });
    if (!fish) return res.status(404).json({ error: 'Рибу не знайдено' });
    res.json(formatFish(fish));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/fish', authMiddleware, requireRole('admin'), uploadFish.single('image'), async (req, res) => {
  try {
    const { name, scientificName, description, maxWeight, maxLength } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Назва риби обов'язкова" });

    const doc = {
      name: String(name).trim(),
      scientificName: scientificName || '',
      description: description || '',
      image: req.file ? { url: req.file.path, publicId: req.file.filename } : null,
      maxWeight: maxWeight ? Number(maxWeight) : null,
      maxLength: maxLength ? Number(maxLength) : null,
      createdBy: req.user.userId,
      createdAt: new Date().toISOString(),
    };
    const result = await db.collection('fish').insertOne(doc);
    res.status(201).json({ message: 'Рибу додано', ...formatFish({ ...doc, _id: result.insertedId }) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/fish/:id', authMiddleware, requireRole('admin'), uploadFish.single('image'), async (req, res) => {
  try {
    const { name, scientificName, description, maxWeight, maxLength, removeImage } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: "Назва риби обов'язкова" });

    const existing = await db.collection('fish').findOne({ _id: new ObjectId(req.params.id) });
    if (!existing) return res.status(404).json({ error: 'Рибу не знайдено' });

    const update = {
      name: String(name).trim(),
      scientificName: scientificName || '',
      description: description || '',
      maxWeight: maxWeight ? Number(maxWeight) : null,
      maxLength: maxLength ? Number(maxLength) : null,
      updatedAt: new Date().toISOString(),
    };
    if (req.file) {
      if (existing.image?.publicId) {
        try { await cloudinary.uploader.destroy(existing.image.publicId); } catch (_) {}
      }
      update.image = { url: req.file.path, publicId: req.file.filename };
    } else if (removeImage === 'true') {
      if (existing.image?.publicId) {
        try { await cloudinary.uploader.destroy(existing.image.publicId); } catch (_) {}
      }
      update.image = null;
    }
    await db.collection('fish').updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.json({ message: 'Рибу оновлено', _id: req.params.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/fish/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const fish = await db.collection('fish').findOne({ _id: new ObjectId(req.params.id) });
    if (!fish) return res.status(404).json({ error: 'Рибу не знайдено' });
    if (fish.image?.publicId) {
      try { await cloudinary.uploader.destroy(fish.image.publicId); } catch (_) {}
    }
    await db.collection('fish').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Рибу видалено', _id: req.params.id, name: fish.name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
//  CATCHES (Записи улову)
//  Додати ці маршрути до server.js після секції FISH
// ============================================================

// ─── Storage для фото улову ───────────────────────────────────
const catchStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'arundo/catches',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
  },
});
const uploadCatch = multer({ storage: catchStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Форматування запису улову ────────────────────────────────
function formatCatch(c) {
  return {
    _id: c._id.toString(),
    userId: c.userId,
    userName: c.userName || '',
    waterbodyId: c.waterbodyId,
    waterbodyName: c.waterbodyName || '',
    waterbodyCoords: c.waterbodyCoords || null,
    date: c.date,
    species: c.species || '',
    fishCount: c.fishCount || 1,
    biggestFishName: c.biggestFishName || '',
    biggestFishWeight: c.biggestFishWeight || 0,
    notes: c.notes || '',
    photos: c.photos || [],
    createdAt: c.createdAt,
    updatedAt: c.updatedAt || null,
  };
}

// ─── GET /api/catches — усі записи (admin бачить всі, user — тільки свої) ──
app.get('/api/catches', authMiddleware, async (req, res) => {
  try {
    const filter = {};

    // Звичайний юзер бачить тільки свої записи
    if (req.user.role !== 'admin') {
      filter.userId = req.user.userId;
    }

    // Фільтр по конкретному юзеру (для адміна)
    if (req.query.userId && req.user.role === 'admin') {
      filter.userId = req.query.userId;
    }

    // Фільтр по водоймі
    if (req.query.waterbodyId) {
      filter.waterbodyId = req.query.waterbodyId;
    }

    const catches = await db
      .collection('catches')
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    res.json(catches.map(formatCatch));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/catches/my — свої записи (зручний аліас) ────────
app.get('/api/catches/my', authMiddleware, async (req, res) => {
  try {
    const catches = await db
      .collection('catches')
      .find({ userId: req.user.userId })
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    res.json(catches.map(formatCatch));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/catches/:id — один запис ────────────────────────
app.get('/api/catches/:id', authMiddleware, async (req, res) => {
  try {
    const catchRecord = await db
      .collection('catches')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!catchRecord) {
      return res.status(404).json({ error: 'Запис не знайдено' });
    }

    // Юзер може бачити тільки свої записи
    if (req.user.role !== 'admin' && catchRecord.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    res.json(formatCatch(catchRecord));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/catches — створити запис улову ─────────────────
app.post(
  '/api/catches',
  authMiddleware,
  uploadCatch.array('photos', 10),
  async (req, res) => {
    try {
      const {
        waterbodyId,
        date,
        species,
        fishCount,
        biggestFishName,
        biggestFishWeight,
        notes,
      } = req.body;

      if (!waterbodyId || !date || !species) {
        return res.status(400).json({
          error: "Водойма, дата та вид риби обов'язкові",
        });
      }

      // Перевіряємо чи існує водойма
      let waterbody = null;
      try {
        waterbody = await db
          .collection('waterbodies')
          .findOne({ _id: new ObjectId(waterbodyId) });
      } catch {
        return res.status(400).json({ error: 'Невірний ID водойми' });
      }

      if (!waterbody) {
        return res.status(404).json({ error: 'Водойму не знайдено' });
      }

      const photos = (req.files || []).map((f) => ({
        url: f.path,
        publicId: f.filename,
      }));

      const doc = {
        userId: req.user.userId,
        userName: req.user.name || '',
        waterbodyId: waterbodyId,
        waterbodyName: waterbody.name,
        waterbodyCoords: waterbody.location?.coordinates
          ? {
              lng: waterbody.location.coordinates[0],
              lat: waterbody.location.coordinates[1],
            }
          : null,
        date: date,
        species: String(species).trim(),
        fishCount: Math.max(1, parseInt(fishCount) || 1),
        biggestFishName: String(biggestFishName || '').trim(),
        biggestFishWeight: parseFloat(biggestFishWeight) || 0,
        notes: String(notes || '').trim(),
        photos,
        createdAt: new Date().toISOString(),
      };

      const result = await db.collection('catches').insertOne(doc);
      res.status(201).json({
        message: 'Запис улову додано',
        catch: formatCatch({ ...doc, _id: result.insertedId }),
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── PUT /api/catches/:id — оновити запис ─────────────────────
app.put(
  '/api/catches/:id',
  authMiddleware,
  uploadCatch.array('photos', 10),
  async (req, res) => {
    try {
      const existing = await db
        .collection('catches')
        .findOne({ _id: new ObjectId(req.params.id) });

      if (!existing) {
        return res.status(404).json({ error: 'Запис не знайдено' });
      }

      // Тільки власник або адмін може редагувати
      if (
        req.user.role !== 'admin' &&
        existing.userId !== req.user.userId
      ) {
        return res.status(403).json({ error: 'Доступ заборонено' });
      }

      const {
        date,
        species,
        fishCount,
        biggestFishName,
        biggestFishWeight,
        notes,
        removePhotos,
      } = req.body;

      let currentPhotos = existing.photos || [];

      // Видаляємо вибрані фото
      if (removePhotos) {
        const toRemove = parseJsonField(removePhotos, []);
        for (const publicId of toRemove) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (_) {}
        }
        currentPhotos = currentPhotos.filter(
          (p) => !toRemove.includes(p.publicId)
        );
      }

      // Додаємо нові фото
      if (req.files && req.files.length > 0) {
        currentPhotos = [
          ...currentPhotos,
          ...req.files.map((f) => ({ url: f.path, publicId: f.filename })),
        ];
      }

      const update = {
        date: date || existing.date,
        species: String(species || existing.species).trim(),
        fishCount: Math.max(1, parseInt(fishCount) || existing.fishCount),
        biggestFishName: String(
          biggestFishName !== undefined ? biggestFishName : existing.biggestFishName
        ).trim(),
        biggestFishWeight:
          biggestFishWeight !== undefined
            ? parseFloat(biggestFishWeight) || 0
            : existing.biggestFishWeight,
        notes: String(notes !== undefined ? notes : existing.notes).trim(),
        photos: currentPhotos,
        updatedAt: new Date().toISOString(),
      };

      await db
        .collection('catches')
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: update }
        );

      res.json({ message: 'Запис оновлено', _id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── DELETE /api/catches/:id — видалити запис ─────────────────
app.delete('/api/catches/:id', authMiddleware, async (req, res) => {
  try {
    const catchRecord = await db
      .collection('catches')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!catchRecord) {
      return res.status(404).json({ error: 'Запис не знайдено' });
    }

    // Тільки власник або адмін може видаляти
    if (
      req.user.role !== 'admin' &&
      catchRecord.userId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    // Видаляємо всі фото з Cloudinary
    for (const photo of catchRecord.photos || []) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (_) {}
    }

    await db
      .collection('catches')
      .deleteOne({ _id: new ObjectId(req.params.id) });

    res.json({ message: 'Запис видалено', _id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/catches/stats/summary — статистика для дашборду ─
app.get('/api/catches/stats/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.role === 'admin' && req.query.userId
      ? req.query.userId
      : req.user.userId;

    const catches = await db
      .collection('catches')
      .find({ userId })
      .toArray();

    const totalFish = catches.reduce((sum, c) => sum + (c.fishCount || 0), 0);

    const biggestCatch = catches
      .filter((c) => c.biggestFishName && c.biggestFishWeight > 0)
      .sort((a, b) => b.biggestFishWeight - a.biggestFishWeight)[0] || null;

    const speciesMap = new Map();
    for (const c of catches) {
      speciesMap.set(
        c.species,
        (speciesMap.get(c.species) || 0) + c.fishCount
      );
    }
    const topSpecies = Array.from(speciesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalSessions: catches.length,
      totalFish,
      biggestCatch: biggestCatch
        ? {
            name: biggestCatch.biggestFishName,
            weight: biggestCatch.biggestFishWeight,
            species: biggestCatch.species,
            date: biggestCatch.date,
            waterbodyName: biggestCatch.waterbodyName,
          }
        : null,
      topSpecies,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/catches/:id — оновити запис ─────────────────────
// ВИПРАВЛЕНИЙ МАРШРУТ: замінити існуючий PUT /api/catches/:id у server.js
app.put(
  '/api/catches/:id',
  authMiddleware,
  uploadCatch.array('photos', 10),
  async (req, res) => {
    try {
      const existing = await db
        .collection('catches')
        .findOne({ _id: new ObjectId(req.params.id) });

      if (!existing) {
        return res.status(404).json({ error: 'Запис не знайдено' });
      }

      // Тільки власник або адмін може редагувати
      if (req.user.role !== 'admin' && existing.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Доступ заборонено' });
      }

      const {
        waterbodyId,
        date,
        species,
        fishCount,
        biggestFishName,
        biggestFishWeight,
        notes,
        removePhotos,
      } = req.body;

      // ── ВИПРАВЛЕННЯ: оновлюємо дані водойми якщо змінився waterbodyId ──
      let waterbodyName = existing.waterbodyName;
      let waterbodyCoords = existing.waterbodyCoords;

      if (waterbodyId && waterbodyId !== existing.waterbodyId) {
        let waterbody = null;
        try {
          waterbody = await db
            .collection('waterbodies')
            .findOne({ _id: new ObjectId(waterbodyId) });
        } catch {
          return res.status(400).json({ error: 'Невірний ID водойми' });
        }

        if (!waterbody) {
          return res.status(404).json({ error: 'Водойму не знайдено' });
        }

        waterbodyName = waterbody.name;
        waterbodyCoords = waterbody.location?.coordinates
          ? { lng: waterbody.location.coordinates[0], lat: waterbody.location.coordinates[1] }
          : null;
      }

      let currentPhotos = existing.photos || [];

      // Видаляємо вибрані фото
      if (removePhotos) {
        const toRemove = parseJsonField(removePhotos, []);
        for (const publicId of toRemove) {
          try { await cloudinary.uploader.destroy(publicId); } catch (_) {}
        }
        currentPhotos = currentPhotos.filter((p) => !toRemove.includes(p.publicId));
      }

      // Додаємо нові фото
      if (req.files && req.files.length > 0) {
        currentPhotos = [
          ...currentPhotos,
          ...req.files.map((f) => ({ url: f.path, publicId: f.filename })),
        ];
      }

      const update = {
        // ── Оновлюємо waterbodyId та пов'язані поля якщо змінились ──
        waterbodyId: waterbodyId || existing.waterbodyId,
        waterbodyName,
        waterbodyCoords,
        date: date || existing.date,
        species: String(species || existing.species).trim(),
        fishCount: Math.max(1, parseInt(fishCount) || existing.fishCount),
        biggestFishName: String(
          biggestFishName !== undefined ? biggestFishName : existing.biggestFishName
        ).trim(),
        biggestFishWeight:
          biggestFishWeight !== undefined
            ? parseFloat(biggestFishWeight) || 0
            : existing.biggestFishWeight,
        notes: String(notes !== undefined ? notes : existing.notes).trim(),
        photos: currentPhotos,
        updatedAt: new Date().toISOString(),
      };

      await db
        .collection('catches')
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });

      res.json({ message: 'Запис оновлено', _id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ============================================================
//  STATS
// ============================================================
app.get('/api/stats', async (req, res) => {
  try {
    const [totalWater, totalFish, totalUsers] = await Promise.all([
      db.collection('waterbodies').countDocuments(),
      db.collection('fish').countDocuments(),
      db.collection('users').countDocuments(),
    ]);
    res.json({
      total_water_bodies: totalWater,
      total_fish_species: totalFish,
      total_users: totalUsers,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
//  HEALTH
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: !!db, port: PORT });
});

// ============================================================
//  404 fallback
// ============================================================
// Кореневий маршрут
app.get('/', (req, res) => {
  res.json({
    message: '🎣 ARUNDO API працює!',
    endpoints: {
      health: '/api/health',
      water: '/api/water',
      fish: '/api/fish',
      auth: '/api/auth',
      stats: '/api/stats'
    }
  });
});

// Обробник 404 для всіх інших маршрутів
app.use((req, res) => {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.path} не знайдено` });
});

/// ============================================================
//  ЗАПУСК
// ============================================================
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log('════════════════════════════════════');
    console.log('  🎣 ARUNDO — сервер запущено');
    console.log(`  http://localhost:${PORT}`);
    console.log('════════════════════════════════════');
  });
}

startServer();

module.exports = app;