const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create', authMiddleware, accountController.createAccount);
router.post('/activate', authMiddleware, accountController.activateAccount);
router.post('/deactivate', authMiddleware, accountController.deactivateAccount);

module.exports = router;
