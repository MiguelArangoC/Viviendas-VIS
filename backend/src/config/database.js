const mongoose = require('mongoose');
const { MONGO_URI } = require('./environment');

let connected = false;

async function connect() {
  if (!MONGO_URI) {
    console.warn('MONGO_URI no está definido en el entorno, se intentará el valor por defecto');
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connected = true;
    console.log('✔️  Conectado a MongoDB');
  } catch (err) {
    connected = false;
    console.warn('⚠️  No se pudo conectar a MongoDB:', err.message);
    // Do not rethrow — allow app to continue in degraded mode
  }
}

function isConnected() {
  return connected || mongoose.connection.readyState === 1;
}

module.exports = { connect, isConnected };
