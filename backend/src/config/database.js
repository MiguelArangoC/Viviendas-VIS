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
      serverSelectionTimeoutMS: 5000, // Timeout después de 5s
      socketTimeoutMS: 45000, // Cerrar sockets después de 45s de inactividad
    });
    connected = true;
    console.log('✔️  Conectado a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.name);
  } catch (err) {
    connected = false;
    console.warn('⚠️  No se pudo conectar a MongoDB:', err.message);
    console.warn('💡 Verifica tu URI de conexión y las credenciales en .env');
    // Do not rethrow — allow app to continue in degraded mode
  }
}

function isConnected() {
  // prefer explicit flag, but fall back to mongoose connection state
  return connected || mongoose.connection.readyState === 1;
}

module.exports = { connect, isConnected };