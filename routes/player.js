const express = require('express');
const router = express.Router();
const Video = require('../schemas/VideoMeta');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');
const { firebaseStorage } = require('../app'); // firebase initialized in app.js
const { writeLog } = require('../utils/logger'); // logging utility

router.get('/:id', async (req, res) => {
  const videoId = req.params.id;
  try {
    await writeLog('INFO', 'Video player request received', { videoId, ip: req.ip });

    const videoData = await Video.findOne({ videoId });
    if (!videoData) {
      await writeLog('WARN', 'Video not found', { videoId });
      return res.status(404).send('Video not found');
    }

    const videoRef = ref(firebaseStorage, `videos/${videoData.videoId}`);
    const videoUrl = await getDownloadURL(videoRef);

    await writeLog('INFO', 'Video URL fetched successfully', { videoId });

    res.render('player', {
      title: videoData.title,
      description: videoData.description,
      videoUrl
    });
  } catch (err) {
    await writeLog('ERROR', 'Error fetching video for player', { videoId, error: err.message });
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
