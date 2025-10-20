const User = require('../models/User');
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Usuario no encontrado');
  
  // Verificar contraseña
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Contraseña incorrecta');
  
  return jwt.sign({ id: user._id, email: user.email, role: user.role });
};

exports.register = async ({ name, email, password }) => {
  // Hash de contraseña
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = new User({ 
    name, 
    email, 
    password: hashedPassword 
  });
  
  await user.save();
  return { id: user._id, email: user.email, name: user.name };
};