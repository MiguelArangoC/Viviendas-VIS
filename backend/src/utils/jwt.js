const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');

exports.sign = (payload, opts = {}) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...opts });
exports.verify = (token) => jwt.verify(token, JWT_SECRET);
