const mongoose = require('mongoose');

const videoMetaSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  description: String,
  tags: [String],
  uploadedAt: { type: Date, default: Date.now },
  size: Number,
  contentType: String,
  firebasePath: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 }                          
}, {
  collection: 'videoMeta'
});

module.exports = mongoose.model('VideoMeta', videoMetaSchema);