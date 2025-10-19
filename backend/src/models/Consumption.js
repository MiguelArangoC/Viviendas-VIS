const mongoose = require('mongoose');

const ConsumptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kwh: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Consumption', ConsumptionSchema);
