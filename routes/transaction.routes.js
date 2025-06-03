const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transaction.controller')
// Aquí irían los endpoints de transferencia

router.post('/', transferController.transfer)

module.exports = router;