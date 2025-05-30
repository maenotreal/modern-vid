const express = require('express');
const multer = require('multer');
const { getStorage, ref, uploadBytes, getMetadata } = require('firebase/storage');
const VideoMeta = require('../schemas/VideoMeta');
const {ref} = require('firebase/storage');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {initializeApp} = require('firebase-admin/app');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

var firebaseApp = initializeApp(firebaseConfig);

var firebaseStorage = getStorage(firebaseApp, firebaseConfig.storageBucket);

console.log(firebaseStorage);

// POST /upload
router.post('/', upload.single('video'), async (req, res) => {
  try {
    const { originalname, mimetype, size, buffer } = req.file;
    const { title, description, tags } = req.body;

    const videoRef = ref(getStorage(firebaseApp), `videos/${originalname}`);
    await uploadBytes(videoRef, buffer);

    const metadata = await getMetadata(videoRef);

    const newVideo = new VideoMeta({
      videoId: originalname,
      title,
      description,
      tags: tags.split(',').map(t => t.trim()),
      size,
      contentType: mimetype,
      firebasePath: `videos/${originalname}`
    });

    await newVideo.save();

    res.status(201).json({ message: 'Video uploaded and metadata saved' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});
 // GET /upload - render the upload form page
router.get('/', (req, res) => {
  res.render('uploadPage'); // renders views/upload.ejs
});
module.exports = router;
