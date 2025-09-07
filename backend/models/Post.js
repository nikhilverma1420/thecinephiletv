const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  cast: {
    type: String,
    trim: true
  },
  quality: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  downloadLink: {
    type: String,
    trim: true
  },
  video: {
    filename: String,
    originalName: String,
    size: Number,
    path: String
  },
  thumbnail: {
    filename: String,
    originalName: String,
    size: Number,
    path: String
  },
  photo: {
    filename: String,
    originalName: String,
    size: Number,
    path: String
  },
  photoLink: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
