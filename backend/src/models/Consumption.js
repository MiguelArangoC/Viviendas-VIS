const mongoose = require('mongoose');

const ConsumptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  kwh: { type: Number, required: true },
  cost: { type: Number, required: true },
  hour: Number,
  meterId: String,
  temperature: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consumption', ConsumptionSchema);