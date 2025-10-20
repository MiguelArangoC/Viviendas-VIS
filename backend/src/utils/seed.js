const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tariff = require('../models/Tariff');
const { MONGO_URI } = require('../config/environment');

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');

    // Limpiar datos existentes
    await User.deleteMany({});
    await Tariff.deleteMany({});

    // Crear tarifas
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

    // Crear usuarios demo
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await User.insertMany([
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
        meterId: 'MET' + (Date.now() + 1)
      }
    ]);

    console.log('✅ Datos de prueba creados');
    console.log('📧 Usuario: demo@energiavis.com / demo123');
    console.log('👨‍💼 Admin: admin@energiavis.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();