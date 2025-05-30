const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VideoMeta' }]
});

module.exports = mongoose.model('User', userSchema);
