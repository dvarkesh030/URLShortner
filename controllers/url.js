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


async function AnalyticsofURL(req,res) {
    const shortId = req.query.shortId;
    const result = await URL.findOne({
        shortId:shortId,
    },);
    res.json({totalClicks: result.totalClicks.length,
        lastClick:result.totalClicks[result.totalClicks.length-1].timestamp
    });
};


module.exports={CreateNewURL,
    RedirectToURL,
    AnalyticsofURL
};