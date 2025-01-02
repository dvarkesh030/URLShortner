const express = require('express');
const router = express.Router();
const {LoadMainPageData} = require('../controllers/url');
router.get('/home', LoadMainPageData);
module.exports=router;
