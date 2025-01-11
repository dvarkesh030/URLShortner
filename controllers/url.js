const shortid = require('shortid')
const URL = require('../models/url');
const session = require('express-session');
async function CreateNewURL(req,res) {
    const body = req.body;
    if(body.searchedUrl !== ''){
        const URLs= await URL.find({createdBy:session.user.id});
        filteredURLs = URLs.filter((item)=>{return item.redirectURL.includes(body.searchedUrl)});
        return res.render('home',{allURLs:filteredURLs,User:session.user});
    }
    if(!body.url){
        console.log(session.user);
        const URLs= await URL.find({createdBy:session.user.id});
        return res.render('home',{allURLs:URLs,User:session.user});
    }
    const newURL = shortid.generate();
    await URL.create({
        shortId:newURL, 
        redirectURL:body.url,
        createdBy:session.user.id,
        totalClicks:[]
    });
    const URLs= await URL.find({createdBy:session.user.id});
    return res.render('home',{allURLs:URLs,User:session.user});
    // return res.status(201).json({shortId:newURL});
};
async function RedirectToURL(req,res) {
    const shortId = req.query.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId:shortId,
    },{$push:{
        totalClicks:{timestamp:Date.now(),},
    }});
    res.redirect(entry.redirectURL);
};

async function searchUrl(req,res) {
    const {urlName} = req.body;
    const URLs = await URL.find({redirectURL:urlName,createdBy:session.user.id});
    res.render('home',{allURLs:URLs,User:session.user});
};

async function LoadMainPageData(req,res){
    const URLs = await URL.find({createdBy:session.user.id});
    res.render('home',{allURLs:URLs,User:session.user});
};

module.exports={CreateNewURL,
    RedirectToURL,
    LoadMainPageData,
    searchUrl
};