const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.get('/', auth, transactionController.list);
router.post('/recharge', auth, transactionController.recharge);

module.exports = router;