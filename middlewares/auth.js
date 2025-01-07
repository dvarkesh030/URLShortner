const User = require('../models/Users');


async function checkValidUser(req,res,next){
    if(req.cookies.id){
        next();
    }else{
        res.redirect('/auth/login');
    }
}
module.exports={checkValidUser};