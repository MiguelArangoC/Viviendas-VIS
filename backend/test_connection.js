const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/viviendas_vis';

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    console.log('📍 URI:', MONGO_URI.replace(/:[^:@]+@/, ':****@')); // Oculta password
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ ¡Conexión exitosa a MongoDB!');
    console.log('📊 Base de datos:', mongoose.connection.name);
    console.log('🌍 Host:', mongoose.connection.host);
    
    // Listar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Colecciones existentes:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

testConnection();