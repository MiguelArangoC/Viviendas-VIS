const Transaction = require('../models/Transaction');

exports.list = async (req, res, next) => {
  try {
    const tx = await Transaction.find({ user: req.user.id });
    res.json(tx);
  } catch (err) { next(err); }
};
