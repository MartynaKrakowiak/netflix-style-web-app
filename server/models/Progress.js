const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  watchedDuration: { type: Number, default: 0 },
  contentType: { type: String, enum: ['Movie', 'Series'] },

});

module.exports = mongoose.model('Progress', ProgressSchema);