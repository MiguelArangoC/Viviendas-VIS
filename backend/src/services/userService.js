const User = require('../models/User');

exports.findById = async (id) => {
  const u = await User.findById(id).select('-password');
  if (!u) throw new Error('Usuario no encontrado');
  return u;
};
