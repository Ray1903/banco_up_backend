const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../models');
const userController = require('../controllers/user.controller')


router.post('/insert',userController.insertUser);
router.post('/login', userController.login); 
router.get('/profile', userController.getProfile);
router.get('/users', userController.getUsersByBlockedStatus);

module.exports  = router;


