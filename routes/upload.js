const express = require('express');
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getMetadata } = require('firebase/storage');

const VideoMeta = require('../schemas/VideoMeta');
const VidData = require('../schemas/vidData'); //!!
const User = require('../schemas/User');        // !!
const verifyToken = require('../middleware/verifyToken'); // !!

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase app and storage
const firebaseApp = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(firebaseApp);

//  POST /upload protected route for video upload JWT
router.post('/', verifyToken, upload.single('video'), async (req, res) => {
  try {
    const { originalname, mimetype, size, buffer } = req.file;
    const { title, description, tags } = req.body;

    const videoRef = ref(firebaseStorage, `videos/${originalname}`);
    await uploadBytes(videoRef, buffer);

    const metadata = await getMetadata(videoRef);

    const newVideo = new VideoMeta({
      videoId: originalname,
      title,
      description,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      size,
      contentType: mimetype,
      firebasePath: `videos/${originalname}`,
      user: req.user.id // user ID from JWT
    });

    await newVideo.save();

    const vidData = new VidData({
      userId: req.user.id,
      videoMetaId: newVideo._id
    });

    await vidData.save();

    // update user profile with new video
    await User.findByIdAndUpdate(req.user.id, {
      $push: { videos: newVideo._id }
    });

    res.status(201).json({ message: 'Video uploaded and metadata saved' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// GET /upload download page
router.get('/', (req, res) => {
  res.render('uploadPage');
});

module.exports = router;
