
const express = require('express');
const path = require('path');
const {connectionOfMongoDb} = require('./connectMongoDB');
const cookies = require('cookie-parser');


const UrlHome = require('./routers/URL');
const staticRouter = require('./routers/staticRouter');
const {checkValidUser} = require('./middlewares/auth');
const app = express();
const port = 4500;


app.use(cookies());
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.set('view engine','ejs');
app.set('views',path.resolve('./views'));

connectionOfMongoDb("mongodb://127.0.0.1:27017/urldata");
app.listen(port);

app.use('/auth',staticRouter);
app.use('/',checkValidUser,UrlHome);