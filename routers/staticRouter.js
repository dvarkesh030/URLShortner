const express = require('express');
const router = express.Router();
const URL = require('../models/url');
const {createNewUser,signUp,LoadLoginpage,checklogin} = require('../controllers/auth');

router.get('/signup',signUp);
router.get('/login',LoadLoginpage);
router.post('/checklogin',checklogin);
router.post('/createNewUser',createNewUser);
module.exports=router;