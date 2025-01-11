const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const URL = require('../models/url');
var session = require('express-session')

async function checkAuthorization(req,res,next){
    const user = session.user;
    if(user.role === 'admin'){
        const URLs= await URL.find({});
        console.log(URLs);
        return res.render('home',{allURLs:URLs,User:user});    
    }else if(user.role === 'normal'){
        const URLs= await URL.find({createdBy:user.id});
        return res.render('home',{allURLs:URLs,User:user});
    }
    return res.render('home',{allURLs:[],User:user});
}
async function checkValidUser(req,res,next){
    if(req.cookies?.id){
        const secretKey = 'MDvarkesh';
        const id = req.cookies.id;
        try {
            const userData = jwt.verify(id, secretKey);
            session.user = userData;
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
module.exports={checkValidUser,checkAuthorization};