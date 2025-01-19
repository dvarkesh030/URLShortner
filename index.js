const express = require('express');
const path = require('path');
const {connectionOfMongoDb} = require('./connectMongoDB');
const cookies = require('cookie-parser');


const UrlHome = require('./routers/URL');
const UrlPost = require('./routers/URLPost');
const staticRouter = require('./routers/staticRouter');
const {checkValidUser,checkAuthorization} = require('./middlewares/auth');
const session = require('express-session');
const app = express();
const port = 4500;
app.use(session({
    secret: 'MDvarkesh',
    resave: false,
    saveUninitialized:true,
    cookie:{secure:false}
}));   

app.use(cookies());
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.set('view engine','ejs');
app.set('views',path.resolve('./views'));

app.use('/public', express.static('public'));

connectionOfMongoDb("mongodb://127.0.0.1:27017/urldata");
app.listen(port);
app.use('/auth',staticRouter);
app.use('/urlPost',UrlPost); 
app.use('/',checkValidUser,checkAuthorization,UrlHome);