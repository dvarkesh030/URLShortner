const {CreateNewURL,RedirectToURL,AnalyticsofURL} = require('../controllers/url')
const express = require('express');
const router = express.Router();

router.post('/',CreateNewURL);
router.get('/',RedirectToURL);
router.get('/analysis',AnalyticsofURL);

module.exports=router;