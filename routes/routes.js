const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('user', require('./user.routes'));



module.exports = router;
