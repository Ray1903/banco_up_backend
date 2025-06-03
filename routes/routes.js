const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/user', require('./user.routes'));
router.use('/transaction', require('./transaction.routes'))
router.use('/admin', require('./admin.routes'));


module.exports = router;
