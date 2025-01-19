const express = require('express');
const router = express.Router();
const {editURL,CreateNewURL,deleteURL,RedirectToURL} = require('../controllers/url');
router.get('/redirect',RedirectToURL);
router.post('/',CreateNewURL);
router.post('/delete',deleteURL); 
router.post('/edit',editURL);
module.exports=router; 