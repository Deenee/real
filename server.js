var express = require('express');
var app = express();
var port = process.env.Port || 8080;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');

var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var logout = require('express-passport-logout');

var configDB = require('./config/database.js');

mongoose.Promise = require('bluebird');
mongoose.connect(configDB.url, {
    useMongoClient: true,
    promiseLibrary: require('bluebird'),
});
require('./config/passport')(passport);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'anystringoftext',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('view engine', 'ejs');

require('./app/routes.js')(app, passport, logout);

app.listen(port);
console.log('App is running on port '+ port);