const users = require('../models/Users');
const URL = require('../models/url');
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
        return res.render('login');
    }
    const URLs= await URL.find({});
    return res.render('home',{allURLs:URLs});
};
module.exports={signUp,createNewUser,LoadLoginpage,checklogin};