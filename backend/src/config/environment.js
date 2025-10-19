require('dotenv').config({ path: process.env.ENV_PATH || undefined });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/viviendas_vis';
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

module.exports = { MONGO_URI, PORT, JWT_SECRET };
