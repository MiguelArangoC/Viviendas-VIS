const express = require('express');
const router = express.Router();
const tariffController = require('../controllers/tariffController');

router.get('/', tariffController.list);

module.exports = router;
