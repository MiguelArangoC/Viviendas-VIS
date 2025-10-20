const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'M8v$eX9ap2@r!LqZ7uFw^JgB0Tc&nKmY';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/energia_vis';

// ============================================
// MODELOS DE BASE DE DATOS
// ============================================

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  balance: { type: Number, default: 0 },
  consumption: { type: Number, default: 0 },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Tariff' },
  rewards: { type: Number, default: 0 },
  meterId: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Esquema de Tarifas/Planes
const tariffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  kwhIncluded: { type: Number, required: true },
  extraKwhPrice: { type: Number, required: true },
  color: String,
  features: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Esquema de Consumo Diario
const consumptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  kwh: { type: Number, required: true },
  cost: { type: Number, required: true },
  hour: Number,
  meterId: String,
  temperature: Number,
  createdAt: { type: Date, default: Date.now }
});

// Esquema de Transacciones
const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['recharge', 'consumption', 'subscription', 'reward'], required: true },
  amount: { type: Number, required: true },
  description: String,
  paymentMethod: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  balanceBefore: Number,
  balanceAfter: Number,
  createdAt: { type: Date, default: Date.now }
});

// Esquema de Recomendaciones
const recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['alert', 'tip', 'bonus'], required: true },
  title: String,
  message: String,
  potentialSavings: Number,
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

// Esquema de Logros
const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  description: String,
  points: Number,
  unlockedAt: { type: Date, default: Date.now }
});

// Modelos
const User = mongoose.model('User', userSchema);
const Tariff = mongoose.model('Tariff', tariffSchema);
const Consumption = mongoose.model('Consumption', consumptionSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Recommendation = mongoose.model('Recommendation', recommendationSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
  }
  next();
};

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos.' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      meterId: `MET${Date.now()}` // Generar ID de medidor
    });

    await user.save();

    // Crear token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Crear token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        consumption: user.consumption,
        rewards: user.rewards
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
  }
});

// ============================================
// RUTAS DE USUARIO
// ============================================

// Obtener perfil de usuario
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('plan')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil: ' + error.message });
  }
});

// Actualizar perfil
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json({ message: 'Perfil actualizado', user });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil: ' + error.message });
  }
});

// Obtener consumo del usuario
app.get('/api/user/consumption', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, period = 'week' } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      };
    } else {
      // Por defecto, últimos 7 días
      const days = period === 'month' ? 30 : 7;
      dateFilter = {
        date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      };
    }

    const consumption = await Consumption.find({
      user: req.user.userId,
      ...dateFilter
    }).sort({ date: 1 });

    // Calcular totales
    const totalKwh = consumption.reduce((sum, c) => sum + c.kwh, 0);
    const totalCost = consumption.reduce((sum, c) => sum + c.cost, 0);
    const avgDaily = consumption.length > 0 ? totalKwh / consumption.length : 0;

    res.json({
      consumption,
      summary: {
        totalKwh: totalKwh.toFixed(2),
        totalCost: totalCost.toFixed(2),
        avgDaily: avgDaily.toFixed(2),
        days: consumption.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener consumo: ' + error.message });
  }
});

// ============================================
// RUTAS DE TRANSACCIONES
// ============================================

// Realizar recarga
app.post('/api/transactions/recharge', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido.' });
    }

    const user = await User.findById(req.user.userId);
    const balanceBefore = user.balance;
    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      user: user._id,
      type: 'recharge',
      amount,
      description: 'Recarga de saldo',
      paymentMethod: paymentMethod || 'online',
      balanceBefore,
      balanceAfter: user.balance
    });
    await transaction.save();

    // Otorgar puntos de recompensa (1 punto por cada $1000)
    const rewardPoints = Math.floor(amount / 1000);
    if (rewardPoints > 0) {
      user.rewards += rewardPoints;
      await user.save();
    }

    res.json({
      message: 'Recarga exitosa',
      transaction,
      newBalance: user.balance,
      rewardPoints
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar recarga: ' + error.message });
  }
});

// Obtener historial de transacciones
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, type } = req.query;
    
    let filter = { user: req.user.userId };
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener transacciones: ' + error.message });
  }
});

// ============================================
// RUTAS DE TARIFAS/PLANES
// ============================================

// Obtener todos los planes
app.get('/api/tariffs', async (req, res) => {
  try {
    const tariffs = await Tariff.find({ isActive: true });
    res.json(tariffs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tarifas: ' + error.message });
  }
});

// Suscribirse a un plan
app.post('/api/tariffs/subscribe', authenticateToken, async (req, res) => {
  try {
    const { tariffId } = req.body;

    const tariff = await Tariff.findById(tariffId);
    if (!tariff) {
      return res.status(404).json({ error: 'Plan no encontrado.' });
    }

    const user = await User.findById(req.user.userId);
    
    if (user.balance < tariff.price) {
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }

    user.plan = tariff._id;
    user.balance -= tariff.price;
    await user.save();

    const transaction = new Transaction({
      user: user._id,
      type: 'subscription',
      amount: -tariff.price,
      description: `Suscripción al plan ${tariff.name}`,
      balanceBefore: user.balance + tariff.price,
      balanceAfter: user.balance
    });
    await transaction.save();

    res.json({
      message: 'Suscripción exitosa',
      plan: tariff,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar suscripción: ' + error.message });
  }
});

// ============================================
// MOTOR DE ANÁLISIS Y RECOMENDACIONES
// ============================================

// Analizar consumo y generar recomendaciones
app.get('/api/recommendations', authenticateToken, async (req, res) => {
  try {
    // Obtener consumo de los últimos 7 días
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const consumption = await Consumption.find({
      user: req.user.userId,
      date: { $gte: weekAgo }
    });

    if (consumption.length === 0) {
      return res.json({ recommendations: [], analysis: { status: 'insufficient_data' } });
    }

    const totalKwh = consumption.reduce((sum, c) => sum + c.kwh, 0);
    const avgDaily = totalKwh / consumption.length;
    const user = await User.findById(req.user.userId).populate('plan');

    // Calcular promedio nacional (simulado)
    const nationalAvg = 5.5; // kWh/día promedio en Colombia

    let recommendations = [];
    let analysis = {
      avgDaily: avgDaily.toFixed(2),
      totalWeek: totalKwh.toFixed(2),
      status: avgDaily > nationalAvg ? 'high' : 'normal',
      vsNational: ((avgDaily / nationalAvg - 1) * 100).toFixed(1)
    };

    // Generar recomendaciones basadas en el consumo
    if (avgDaily > nationalAvg * 1.2) {
      recommendations.push({
        type: 'alert',
        title: 'Consumo Alto Detectado',
        message: `Tu consumo diario promedio (${avgDaily.toFixed(1)} kWh) está un ${analysis.vsNational}% por encima del promedio nacional.`,
        potentialSavings: (avgDaily - nationalAvg) * 30 * (user.plan ? user.plan.extraKwhPrice : 500),
        priority: 'high'
      });

      recommendations.push({
        type: 'tip',
        title: 'Desconecta Dispositivos en Standby',
        message: 'Los dispositivos en modo standby pueden consumir hasta 10-15% de tu energía total.',
        potentialSavings: totalKwh * 0.12 * 500,
        priority: 'medium'
      });
    } else {
      recommendations.push({
        type: 'bonus',
        title: '¡Consumo Eficiente!',
        message: 'Estás manteniendo un consumo por debajo del promedio. ¡Sigue así!',
        potentialSavings: 0,
        priority: 'low'
      });
    }

    // Detectar picos de consumo
    const maxConsumption = Math.max(...consumption.map(c => c.kwh));
    if (maxConsumption > avgDaily * 1.5) {
      recommendations.push({
        type: 'tip',
        title: 'Picos de Consumo Detectados',
        message: 'Algunos días tu consumo es significativamente más alto. Intenta distribuir el uso de electrodomésticos.',
        potentialSavings: (maxConsumption - avgDaily) * 500,
        priority: 'medium'
      });
    }

    // Guardar recomendaciones en la base de datos
    for (const rec of recommendations) {
      const existing = await Recommendation.findOne({
        user: req.user.userId,
        title: rec.title,
        isRead: false
      });

      if (!existing) {
        await Recommendation.create({
          user: req.user.userId,
          ...rec
        });
      }
    }

    res.json({ recommendations, analysis });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar recomendaciones: ' + error.message });
  }
});

// Obtener recomendaciones guardadas
app.get('/api/recommendations/history', authenticateToken, async (req, res) => {
  try {
    const recommendations = await Recommendation.find({
      user: req.user.userId
    }).sort({ createdAt: -1 }).limit(20);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener recomendaciones: ' + error.message });
  }
});

// Marcar recomendación como leída
app.put('/api/recommendations/:id/read', authenticateToken, async (req, res) => {
  try {
    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { isRead: true },
      { new: true }
    );

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar recomendación: ' + error.message });
  }
});

// ============================================
// RUTAS DE ADMINISTRACIÓN
// ============================================

// Obtener todos los usuarios (solo admin)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .populate('plan')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios: ' + error.message });
  }
});

// Estadísticas generales (solo admin)
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    const consumptionStats = await Consumption.aggregate([
      {
        $group: {
          _id: null,
          totalKwh: { $sum: '$kwh' },
          totalCost: { $sum: '$cost' },
          avgKwh: { $avg: '$kwh' }
        }
      }
    ]);

    const revenueStats = await Transaction.aggregate([
      { $match: { type: 'recharge', status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers
      },
      consumption: consumptionStats[0] || { totalKwh: 0, totalCost: 0, avgKwh: 0 },
      revenue: revenueStats[0] || { totalRevenue: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas: ' + error.message });
  }
});

// Crear/actualizar tarifa (solo admin)
app.post('/api/admin/tariffs', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, kwhIncluded, extraKwhPrice, color, features } = req.body;

    const tariff = new Tariff({
      name,
      description,
      price,
      kwhIncluded,
      extraKwhPrice,
      color,
      features
    });

    await tariff.save();
    res.status(201).json({ message: 'Tarifa creada', tariff });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tarifa: ' + error.message });
  }
});

// Registrar consumo desde medidor inteligente (simulación API)
app.post('/api/meter/reading', authenticateToken, async (req, res) => {
  try {
    const { meterId, kwh, timestamp } = req.body;

    const user = await User.findOne({ meterId }).populate('plan');
    if (!user) {
      return res.status(404).json({ error: 'Medidor no encontrado.' });
    }

    // Calcular costo
    let cost = 0;
    if (user.plan) {
      const monthlyConsumption = await Consumption.aggregate([
        {
          $match: {
            user: user._id,
            date: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$kwh' } } }
      ]);

      const totalMonthly = monthlyConsumption[0]?.total || 0;
      
      if (totalMonthly + kwh > user.plan.kwhIncluded) {
        const extraKwh = totalMonthly + kwh - user.plan.kwhIncluded;
        cost = extraKwh * user.plan.extraKwhPrice;
      }
    } else {
      cost = kwh * 500; // Precio base por defecto
    }

    // Registrar consumo
    const consumption = new Consumption({
      user: user._id,
      date: timestamp ? new Date(timestamp) : new Date(),
      kwh,
      cost,
      meterId
    });
    await consumption.save();

    // Actualizar consumo total del usuario
    user.consumption += kwh;
    
    // Descontar del saldo si aplica
    if (cost > 0) {
      user.balance -= cost;
      
      const transaction = new Transaction({
        user: user._id,
        type: 'consumption',
        amount: -cost,
        description: `Consumo de ${kwh} kWh`,
        balanceBefore: user.balance + cost,
        balanceAfter: user.balance
      });
      await transaction.save();
    }

    await user.save();

    res.json({
      message: 'Lectura registrada',
      consumption,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar lectura: ' + error.message });
  }
});

// ============================================
// CONEXIÓN A BASE DE DATOS E INICIO
// ============================================

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // Crear tarifas por defecto si no existen
    const tariffCount = await Tariff.countDocuments();
    if (tariffCount === 0) {
      await Tariff.insertMany([
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
          features: ['200 kWh incluidos', 'Soporte prioritario', 'App móvil', 'Alertas personalizadas']
        },
        {
          name: 'Premium',
          description: 'Para hogares con alto consumo',
          price: 120000,
          kwhIncluded: 350,
          extraKwhPrice: 500,
          color: 'purple',
          features: ['350 kWh incluidos', 'Soporte 24/7', 'App móvil', 'Alertas personalizadas', 'Asesoría energética']
        }
      ]);
      console.log('✅ Tarifas por defecto creadas');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});