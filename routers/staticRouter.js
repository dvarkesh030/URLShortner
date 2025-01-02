const express = require('express');
const router = express.Router();
const URL = require('../models/url');
const {LoadMainPageData,CreateNewURL,RedirectToURL} = require('../controllers/url');

router.get('/', LoadMainPageData);
router.post('/',CreateNewURL);
router.get('/redirect',RedirectToURL);
module.exports=router;