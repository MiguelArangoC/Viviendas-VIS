const Consumption = require('../models/Consumption');

exports.record = async (userId, kwh) => {
  const c = new Consumption({ user: userId, kwh });
  await c.save();
  return c;
};
