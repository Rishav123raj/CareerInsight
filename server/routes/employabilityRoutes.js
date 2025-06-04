const express = require('express');
const router = express.Router();
const { calculateEmployability } = require('../controllers/employabilityController');

router.post('/emp-score', calculateEmployability);

module.exports = router;
