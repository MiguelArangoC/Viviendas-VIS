const mongoose = require('mongoose');

const TariffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricePerKWh: { type: Number, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tariff', TariffSchema);
