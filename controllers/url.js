const shortid = require('shortid')
const URL = require('../models/url');

async function CreateNewURL(req,res) {
    const body = req.body;
    if(!body.url)return res.status(400).json({error:"URL not found"});
    const newURL = shortid.generate();
    await URL.create({
        shortId:newURL, 
        redirectURL:body.url,
        totalClicks:[]
    });
    const URLs= await URL.find({});
    return res.render('home',{allURLs:URLs});
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


async function LoadMainPageData(req,res){
    const URLs = await URL.find({});
    res.render('home',{allURLs:URLs});
};

module.exports={CreateNewURL,
    RedirectToURL,
    LoadMainPageData
};