const User = require('../models/Users');

async function checkValidUser(req,res,next){
    const {name,email, password} = req.body;
    const user = await User.findOne({name,email,password});
    if(!user){
        return res.render('signup');
    }else{
        req.user = user;
        next();
    }
}
module.exports={checkValidUser};