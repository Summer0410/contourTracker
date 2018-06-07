var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/contourTracker');
//var db = mongoose.connection;
var cons = require('consolidate');
var routes = require('./routes/index');
var users = require('./routes/users');
var fileUpload = require('express-fileupload');
var fs = require('fs');

//Init app
var app = express();
//View Engine
app.set('views',path.join(__dirname,'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));

//app.engine('html',cons.swig);//test to use html
app.set('view engine', 'handlebars');

//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//Set public/static folder
app.use(express.static(path.join(__dirname,'public')));

//set default options
// default options BELOW IS A TEST**************************************** 
// I can create a file object here.
app.use(fileUpload());
//Express Session 
app.use(session({
	secret: 'bazinga',
	saveUninitialized: true,
	resave: true
}))
//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Express Validator
 app.use(expressValidator({
   errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

   while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
     }
     return {
       param : formParam,
       msg   : msg,
       value : value
     };
   }
 }));
 
 //Connect Flash
 app.use(flash());

 //Set global variabels
 app.use(function(req,res,next){
 	res.locals.success_msg = req.flash('success_msg');
 	res.locals.err_msg = req.flash('err_msg');
 	res.locals.error = req.flash('error');
 	next();
 });
//set routes
 app.use('/', routes);
 app.use('./users', users);
//set port
 app.set('port', (process.env.PORT || 8000));
 app.listen(app.get('port'), function(){
 	console.log('Server is listening on port '+ app.get('port'));
 });
 


