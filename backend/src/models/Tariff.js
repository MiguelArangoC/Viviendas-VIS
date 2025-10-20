const mongoose = require('mongoose');

const TariffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  kwhIncluded: { type: Number, required: true },
  extraKwhPrice: { type: Number, required: true },
  color: String,
  features: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tariff', TariffSchema);