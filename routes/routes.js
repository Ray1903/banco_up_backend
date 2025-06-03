const express = require('express');
const router = express.Router();

router.use('/user', require('./user.routes'));
router.use('/transaction', require('./transaction.routes'))
router.use('/account', require('./account.routes'));


module.exports = router;
