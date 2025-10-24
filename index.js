const express = require('express');
const path = require('path');
const {connectionOfMongoDb} = require('./connectMongoDB');
const cookies = require('cookie-parser');

const UrlHome = require('./routers/URL');
const UrlPost = require('./routers/URLPost');
const tableFilterClear = require('./routers/tableFilterClear');
const staticRouter = require('./routers/staticRouter');
const {checkValidUser,checkAuthorization} = require('./middlewares/auth');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 4500;

app.use(session({
    secret: process.env.secretv,
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

connectionOfMongoDb(process.env.MONGO_URI);
app.listen(port);
app.use('/auth',staticRouter);
app.use('/urlPost',UrlPost);
app.use('/tableFilterClear',tableFilterClear);
app.use('/',checkValidUser,checkAuthorization,UrlHome);