const users = require('../models/Users');
const URL = require('../models/url');
const jwt = require('jsonwebtoken');
const session = require('express-session');

async function signUp(req,res) {
    req.session = null;
    res.clearCookie("id");
    res.clearCookie("id.sig");
    res.render('signup');
};
async function createNewUser(req,res) {
    const { name, email, password } = req.body;
    const user = users.create({
        name: name,
        email: email,
        password:password,
        role:'normal'
    });
    res.redirect('/login');
}
async function LoadLoginpage(req,res) {
    res.render('login');
}
async function checklogin(req,res) {
    const {email, password} = req.body;
    const user = await users.findOne({email,password});
    if(!user){
        return res.render('login',{
            error:"Invalid Email or Password"
        });
    }
    const payload = {
        id: user._id,
        name:user.name,
        email:user.email,
        role:user.role
    };
    const secretKey = 'MDvarkesh';
    const signedToken = jwt.sign(payload,secretKey);
    res.cookie("id",signedToken);
    session.user = payload;
    return res.redirect('/');
};
module.exports={signUp,createNewUser,LoadLoginpage,checklogin};
    