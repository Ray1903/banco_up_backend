const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller')


router.post('/', transactionController.transfer)
router.get('/account/:accountId', transactionController.getTransactionsByAccount);

module.exports = router;