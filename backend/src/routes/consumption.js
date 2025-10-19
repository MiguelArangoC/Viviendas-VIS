const express = require('express');
const router = express.Router();
const consumptionController = require('../controllers/consumptionController');

router.post('/', consumptionController.record);

module.exports = router;
