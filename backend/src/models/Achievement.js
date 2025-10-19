const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  achievedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Achievement', AchievementSchema);
