const User = require('../models/Users');
const jwt = require('jsonwebtoken');

async function checkValidUser(req,res,next){
    if(req.cookies?.id){
        const secretKey = 'MDvarkesh';
        const id = req.cookies.id;
        try {
            const decoded = jwt.verify(id, secretKey);
            next();
        } catch (err) {
            req.session = null;
            res.clearCookie("id");
            res.clearCookie("id.sig");
            res.redirect('/auth/login');
        }
    }else{
        res.redirect('/auth/login');
    }
}
module.exports={checkValidUser};