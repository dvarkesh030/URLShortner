const express = require('express');
const router = express.Router();
const {LoadMainPageData,CreateNewURL,RedirectToURL,searchUrl} = require('../controllers/url');

router.get('/redirect',RedirectToURL);
router.get('/home', LoadMainPageData);
router.post('/',CreateNewURL);
router.get('/',LoadMainPageData);
module.exports=router;
