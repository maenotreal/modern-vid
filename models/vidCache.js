const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  contentLength: { type: Number, required: true },
  contentType: { type: String, required: true },
  lastAccessed: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 3600000) } // 1 час
});

let VidepCache = mongoose.model('VidepCache', adSchema);

module.exports = mongoose.model('VideoCache', videoSchema);