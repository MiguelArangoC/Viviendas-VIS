const Tariff = require('../models/Tariff');

exports.list = async (req, res, next) => {
  try {
    const tariffs = await Tariff.find();
    res.json(tariffs);
  } catch (err) { next(err); }
};
