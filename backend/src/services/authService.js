const User = require('../models/User');
const jwt = require('../utils/jwt');

exports.login = async ({ email, password }) => {
  // Very minimal: find user and return a token (no password check in stub)
  const user = await User.findOne({ email });
  if (!user) throw new Error('Usuario no encontrado');
  return jwt.sign({ id: user._id, email: user.email });
};

exports.register = async ({ name, email, password }) => {
  const user = new User({ name, email, password });
  await user.save();
  return { id: user._id, email: user.email, name: user.name };
};
