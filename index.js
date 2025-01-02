
const express = require('express');
const path = require('path');
const {connectionOfMongoDb} = require('./connectMongoDB');
const staticRouter = require('./routers/staticRouter');

const app = express();
const port = 4500;

app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.set('view engine','ejs');
app.set('views',path.resolve('./views'));

connectionOfMongoDb("mongodb://127.0.0.1:27017/urldata");
app.listen(port);

app.use('/',staticRouter);
