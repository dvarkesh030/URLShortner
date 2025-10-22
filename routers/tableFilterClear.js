const express = require('express');
const router = express.Router();
const {clearFilter} = require('../controllers/url');

router.get('/', clearFilter);
module.exports=router;
