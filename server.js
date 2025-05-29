const express = require('express');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const stream = require('stream');
const mongoose = require('mongoose');

require('dotenv').config();

// Инициализация Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Подключение к MongoDB для кеширования
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Схема для кеширования видео
const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  contentLength: { type: Number, required: true },
  contentType: { type: String, required: true },
  lastAccessed: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 3600000) } // 1 час
});

const VideoCache = mongoose.model('VideoCache', videoSchema);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для очистки старых кешей
app.use(async (req, res, next) => {
  await VideoCache.deleteMany({ expiresAt: { $lt: new Date() } });
  next();
});

// Получение видео из Firebase с кешированием
async function getVideoStream(videoId) {
  // Проверяем кеш
  const cached = await VideoCache.findOne({ videoId });
  if (cached) {
    cached.lastAccessed = new Date();
    cached.expiresAt = new Date(Date.now() + 3600000);
    await cached.save();
    
    const videoRef = ref(storage, `videos/${videoId}`);
    return {
      stream: (await getDownloadURL(videoRef)).toString(),
      contentLength: cached.contentLength,
      contentType: cached.contentType
    };
  }

  // Если нет в кеше, загружаем из Firebase
  const videoRef = ref(storage, `videos/${videoId}`);
  const metadata = await getMetadata(videoRef);
  
  // Сохраняем в кеш
  await VideoCache.create({
    videoId,
    contentLength: metadata.size,
    contentType: metadata.contentType
  });

  return {
    stream: (await getDownloadURL(videoRef)).toString(),
    contentLength: metadata.size,
    contentType: metadata.contentType
  };
}

// Потоковая передача видео
app.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const range = req.headers.range;
    
    const { stream: videoUrl, contentLength, contentType } = await getVideoStream(videoId);
    
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
      const chunkSize = end - start + 1;
      
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${contentLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      };
      
      res.writeHead(206, headers);
      
      // Здесь должен быть поток из Firebase
      // В реальной реализации нужно использовать axios или другой HTTP-клиент
      // с поддержкой диапазонов байтов
      const response = await fetch(videoUrl, {
        headers: { Range: `bytes=${start}-${end}` }
      });
      
      response.body.pipe(res);
    } else {
      const headers = {
        'Content-Length': contentLength,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      };
      
      res.writeHead(200, headers);
      
      const response = await fetch(videoUrl);
      response.body.pipe(res);
    }
  } catch (err) {
    console.error('Video streaming error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Статическая страница с плеером
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Очистка кеша по расписанию
setInterval(async () => {
  await VideoCache.deleteMany({ 
    $or: [
      { expiresAt: { $lt: new Date() } },
      { lastAccessed: { $lt: new Date(Date.now() - 3600000) } }
    ]
  });
}, 3600000); // Каждый час

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});