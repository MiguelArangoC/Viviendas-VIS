const express = require('express');
const router = express.Router();
const consumptionController = require('../controllers/consumptionController');
const auth = require('../middleware/auth');

router.post('/', auth, consumptionController.record);
router.get('/', auth, consumptionController.list);

module.exports = router;