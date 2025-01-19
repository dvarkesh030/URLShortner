const shortid = require("shortid");
const URL = require("../models/url");
const session = require("express-session");

async function editURL(req, res) {
  const { id, url } = req.body;
  if (!id || !url) {
    return res.status(400).json({ error: "hey input data" });
  }
  try {
    const row = await URL.findByIdAndUpdate(id, {redirectURL:url});
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the record" });
  }
}


async function CreateNewURL(req, res) {
  const body = req.body;
  if (body.searchedUrl !== "") {
    const URLs = await URL.find({ createdBy: session.user.id });
    filteredURLs = URLs.filter((item) => {
      return item.redirectURL.includes(body.searchedUrl);
    });
    return res.render("home", { allURLs: filteredURLs, User: session.user });
  }
  if (!body.url) {
    return res.redirect("/");
  }
  const newURL = shortid.generate();
  await URL.create({
    shortId: newURL,
    redirectURL: body.url,
    createdBy: session.user.id,
    totalClicks: [],
  });
  return res.redirect("/");
}
async function RedirectToURL(req, res) {
  console.log('dhjsdjhasdj');
  const shortId = req.query.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId: shortId,
    },
    {
      $push: {
        totalClicks: { timestamp: Date.now() },
      },
    }
  );
  res.redirect(entry.redirectURL);
}

async function searchUrl(req, res) {
  const { urlName } = req.body;
  const URLs = await URL.find({
    redirectURL: urlName,
    createdBy: session.user.id,
  });
  res.render("home", { allURLs: URLs, User: session.user });
}

async function LoadMainPageData(req, res) {
  const URLs = await URL.find({ createdBy: session.user.id });
  res.render("home", { allURLs: URLs, User: session.user });
}
async function deleteURL(req, res) {
  const { id } = req.body;
  await URL.findOneAndDelete({ _id: id });
  res.redirect("/");
}
module.exports = {
  CreateNewURL,
  RedirectToURL,
  LoadMainPageData,
  searchUrl,
  deleteURL,
  editURL,
};
