// Metadata save schema


const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },  //filename
  title: String,    //video title
  description: String   //description of the video
}, { collection: 'videos' });  // collection name in MongoDB

module.exports = mongoose.model('Video', VideoSchema);