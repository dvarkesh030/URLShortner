const express = require('express');
const router = express.Router();
const URL = require('../models/url');

router.get('/', async (req,res)=>{
    const URLs = await URL.find({});
    res.render('home',{allURLs:URLs});
});


module.exports=router;