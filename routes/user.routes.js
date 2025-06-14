const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware');


router.post('/insert',userController.insertUser);
router.post('/login', userController.login); 
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/users', userController.getUsersByBlockedStatus);
router.post('/unlock', userController.unlockUser);
router.post('/block', userController.blockUser);

module.exports  = router;
