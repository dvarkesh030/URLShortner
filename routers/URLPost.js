const express = require('express');
const router = express.Router();
const {CreateNewURL} = require('../controllers/url');
router.post('/',CreateNewURL);
module.exports=router;