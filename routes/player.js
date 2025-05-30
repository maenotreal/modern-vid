const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { getStorage, ref, getDownloadURL } = require('firebase/storage');
const { firebaseStorage } = require('../app'); // firebase innitialized in app.js

router.get('/:id', async (req, res) => {
  try {
    const videoData = await Video.findOne({ videoId: req.params.id });
    if (!videoData) return res.status(404).send('Video not found');

    const videoRef = ref(firebaseStorage, `videos/${videoData.videoId}`);
    const videoUrl = await getDownloadURL(videoRef);

    res.render('player', {
      title: videoData.title,
      description: videoData.description,
      videoUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
