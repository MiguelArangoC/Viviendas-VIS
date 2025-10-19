const Recommendation = require('../models/Recommendation');

exports.list = async (req, res, next) => {
  try {
    const recs = await Recommendation.find({ user: req.user?.id });
    res.json(recs);
  } catch (err) { next(err); }
};
