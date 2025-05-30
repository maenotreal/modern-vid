var express = require('express');
var router = express.Router();

const deleteUserCascade = require('../utils/deleteUser'); // Импортируем утилиту удаления

/**
 * GET users listing.
 */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.delete('/delete/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await deleteUserCascade(userId);

    if (result.success) {
      return res.status(200).send('User and all related content deleted successfully.');
    } else {
      return res.status(500).send(`Failed to delete user: ${result.error}`);
    }
  } catch (err) {
    console.error('Unexpected error in user deletion:', err);
    res.status(500).send('Internal Server Error');
  }
});
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VideoMeta' }]
});
module.exports = mongoose.model('User', userSchema);
module.exports = router;
