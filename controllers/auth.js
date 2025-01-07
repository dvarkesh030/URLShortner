const users = require('../models/Users');
const URL = require('../models/url');
const jwt = require('jsonwebtoken');


async function signUp(req,res) {
    res.render('signup');
};
async function createNewUser(req,res) {
    const { name, email, password } = req.body;
    const user = users.create({
        name: name,
        email: email,
        password:password
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
        email:user.email
    };
    const secretKey = 'MDvarkesh';
    const signedToken = jwt.sign(payload,secretKey);
    res.cookie("id",signedToken);
    return res.redirect('/home');
};
module.exports={signUp,createNewUser,LoadLoginpage,checklogin};