const Consumption = require('../models/Consumption');

exports.record = async (req, res, next) => {
  try {
    const c = new Consumption({ user: req.user.id, kwh: req.body.kwh });
    await c.save();
    res.status(201).json(c);
  } catch (err) { next(err); }
};
