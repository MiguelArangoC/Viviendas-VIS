const Consumption = require('../models/Consumption');
const User = require('../models/User');

exports.record = async (req, res, next) => {
  try {
    const { kwh, cost } = req.body;
    const c = new Consumption({ 
      user: req.user.id, 
      kwh,
      cost: cost || kwh * 500 // Precio por defecto
    });
    await c.save();
    
    // Actualizar consumo total del usuario
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { consumption: kwh }
    });
    
    res.status(201).json(c);
  } catch (err) { 
    next(err); 
  }
};

exports.list = async (req, res, next) => {
  try {
    const { startDate, endDate, period = 'week' } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      };
    } else {
      const days = period === 'month' ? 30 : 7;
      dateFilter = {
        date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      };
    }

    const consumption = await Consumption.find({
      user: req.user.id,
      ...dateFilter
    }).sort({ date: 1 });

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
  } catch (err) {
    next(err);
  }
};