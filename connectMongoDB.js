const mongoose = require('mongoose');
mongoose.set("strictQuery",true);
async function connectionOfMongoDb(url){
    return mongoose.connect(url);
}
module.exports={
    connectionOfMongoDb
};