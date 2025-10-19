const userService = require('../services/userService');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};
