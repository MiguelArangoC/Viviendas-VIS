const express = require('express');
const router = express.Router();
const { API_PREFIX } = require('../config/constants');

const auth = require('./auth');
const user = require('./user');
const tariff = require('./tariff');
const transaction = require('./transaction');
const consumption = require('./consumption');
const recommendation = require('./recommendation');
const admin = require('./admin');

router.use(`${API_PREFIX}/auth`, auth);
router.use(`${API_PREFIX}/users`, user);
router.use(`${API_PREFIX}/tariffs`, tariff);
router.use(`${API_PREFIX}/transactions`, transaction);
router.use(`${API_PREFIX}/consumptions`, consumption);
router.use(`${API_PREFIX}/recommendations`, recommendation);
router.use(`${API_PREFIX}/admin`, admin);

module.exports = router;
