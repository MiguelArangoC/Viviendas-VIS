const Recommendation = require('../models/Recommendation');

exports.forUser = async (userId) => {
  return Recommendation.find({ user: userId });
};
