const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.list = async (req, res, next) => {
  try {
    const { limit = 20, type } = req.query;
    let filter = { user: req.user.id };
    if (type) filter.type = type;

    const tx = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(tx);
  } catch (err) { 
    next(err); 
  }
};

exports.recharge = async (req, res, next) => {
  try {
    const { amount, paymentMethod = 'online' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido.' });
    }

    const user = await User.findById(req.user.id);
    const balanceBefore = user.balance;
    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      user: user._id,
      type: 'charge',
      amount,
      description: 'Recarga de saldo',
      paymentMethod,
      balanceBefore,
      balanceAfter: user.balance
    });
    await transaction.save();

    // Recompensas: 1 punto por cada $1000
    const rewardPoints = Math.floor(amount / 1000);
    if (rewardPoints > 0) {
      user.rewards = (user.rewards || 0) + rewardPoints;
      await user.save();
    }

    res.json({
      message: 'Recarga exitosa',
      transaction,
      newBalance: user.balance,
      rewardPoints
    });
  } catch (err) {
    next(err);
  }
};