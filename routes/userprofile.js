const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const VideoMeta = require('../schemas/VideoMeta');
const User = require('../schemas/userSchema'); 
// add userschema

router.get('/', verifyToken, async (req, res) => {    //не ищет токен
  const user = await User.findById(req.user.id).populate('videos');
  res.render('userprofile', { user });
});

// delete video from user profile
router.post('/delete/:videoId', verifyToken, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  await VideoMeta.deleteOne({ _id: videoId, user: userId });
  await User.findByIdAndUpdate(userId, { $pull: { videos: videoId } });

  res.redirect('/userprofile');
});

// delete user and all related videos
router.post('/deleteUser', verifyToken, async (req, res) => {
  const userId = req.user.id;

  await VideoMeta.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;