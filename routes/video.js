const express = require('express');
const router = express.Router();
const { getStorage, ref, getDownloadURL, getMetadata } = require('firebase/storage');
const mongoose = require('mongoose');
const fetch = require('node-fetch'); // npm i node-fetch
const VideoCache = require('../models/VideoCache');
const { firebaseStorage } = require('../app');

const storage = firebaseStorage; // Уже инициализирован в app.js

async function getVideoStream(videoId) {
  const cached = await VideoCache.findOne({ videoId });
  const videoRef = ref(storage, `videos/${videoId}`);

  if (cached) {
    cached.lastAccessed = new Date();
    cached.expiresAt = new Date(Date.now() + 3600000);
    await cached.save();

    return {
      videoUrl: await getDownloadURL(videoRef),
      contentLength: cached.contentLength,
      contentType: cached.contentType
    };
  }

// Рендер player.ejs
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const videoId = 'your-video.mp4'; // пример ID (имя файла в Firebase)
  res.render('player', {
    videoUrl: `/video/${videoId}`
  });
});



module.exports = router;
  const metadata = await getMetadata(videoRef);
  const videoUrl = await getDownloadURL(videoRef);

  await VideoCache.create({
    videoId,
    contentLength: metadata.size,
    contentType: metadata.contentType
  });

  return {
    videoUrl,
    contentLength: metadata.size,
    contentType: metadata.contentType
  };
}

router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const range = req.headers.range;

    const { videoUrl, contentLength, contentType } = await getVideoStream(videoId);

    if (range) {
      const [start, endRaw] = range.replace(/bytes=/, '').split('-');
      const startByte = parseInt(start, 10);
      const endByte = endRaw ? parseInt(endRaw, 10) : contentLength - 1;
      const chunkSize = endByte - startByte + 1;

      const headers = {
        'Content-Range': `bytes ${startByte}-${endByte}/${contentLength}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      };

      res.writeHead(206, headers);

      const response = await fetch(videoUrl, {
        headers: { Range: `bytes=${startByte}-${endByte}` }
      });

      response.body.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': contentLength,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      });

      const response = await fetch(videoUrl);
      response.body.pipe(res);
    }
  } catch (err) {
    console.error('Video stream error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
