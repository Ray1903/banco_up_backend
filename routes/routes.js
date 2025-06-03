const express = require('express');
const router = express.Router();

router.use('/user', require('./user.routes'));
router.use('/transaction', require('./transaction.routes'))



module.exports = router;
