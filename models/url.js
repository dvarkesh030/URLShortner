const mongoose = require("mongoose");
const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  redirectURL: {
    type: String,
    required: true,
  },
  totalClicks: [
    {
      timestamp: {
        type: Number,
      },
    },
  ],
},{timestamps:true});


const URL = mongoose.model('urldata',urlSchema);
module.exports = URL;