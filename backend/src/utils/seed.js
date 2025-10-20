const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tariff = require('../models/Tariff');
const { MONGO_URI } = require('../config/environment');

async function seed() {
  try {
    console.log('🔄 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Conectado a MongoDB Atlas');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await User.deleteMany({});
    await Tariff.deleteMany({});

    // Crear tarifas
    console.log('💰 Creando tarifas...');
    const tariffs = await Tariff.insertMany([
      {
        name: 'Básico',
        description: 'Plan ideal para hogares pequeños',
        price: 50000,
        kwhIncluded: 100,
        extraKwhPrice: 600,
        color: 'blue',
        features: ['100 kWh incluidos', 'Soporte básico', 'App móvil']
      },
      {
        name: 'Familiar',
        description: 'Perfecto para familias medianas',
        price: 80000,
        kwhIncluded: 200,
        extraKwhPrice: 550,
        color: 'green',
        features: ['200 kWh incluidos', 'Soporte prioritario', 'Alertas']
      },
      {
        name: 'Premium',
        description: 'Para hogares con alto consumo',
        price: 120000,
        kwhIncluded: 350,
        extraKwhPrice: 500,
        color: 'purple',
        features: ['350 kWh incluidos', 'Soporte 24/7', 'Asesoría']
      }
    ]);
    console.log(`✅ ${tariffs.length} tarifas creadas`);

    // Crear usuarios demo
    console.log('👥 Creando usuarios demo...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const users = await User.insertMany([
      {
        name: 'Usuario Demo',
        email: 'demo@energiavis.com',
        password: hashedPassword,
        balance: 100000,
        consumption: 150,
        rewards: 500,
        plan: tariffs[0]._id,
        meterId: 'MET' + Date.now()
      },
      {
        name: 'Admin Demo',
        email: 'admin@energiavis.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        balance: 0,
        consumption: 0,
        rewards: 0,
        meterId: 'MET' + (Date.now() + 1)
      }
    ]);
    console.log(`✅ ${users.length} usuarios creados`);

    console.log('\n' + '='.repeat(50));
    console.log('✨ Base de datos inicializada correctamente');
    console.log('='.repeat(50));
    console.log('\n📧 Credenciales de prueba:');
    console.log('   Usuario: demo@energiavis.com / demo123');
    console.log('   Admin:   admin@energiavis.com / admin123');
    console.log('\n💾 Base de datos:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('='.repeat(50) + '\n');
    
    await mongoose.connection.close();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Consejos:');
    console.error('   1. Verifica que MONGO_URI esté correctamente configurado en .env');
    console.error('   2. Asegúrate de que tu IP esté en la lista blanca de MongoDB Atlas');
    console.error('   3. Verifica que las credenciales sean correctas');
    console.error('   4. Comprueba tu conexión a Internet\n');
    process.exit(1);
  }
}

seed();