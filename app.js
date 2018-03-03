var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;


var db = mongoose.connect('mongodb://naresh:naresh@ds063856.mlab.com:63856/mycontacts', { useMongoClient: true });
mongoose.Promise = global.Promise;
// Use bluebird
mongoose.Promise = require('bluebird');
var UserSchema = new mongoose.Schema({
    name:String,
    email: String,
    number:String,
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    roles: [String]
});

var Employee = mongoose.model("Employee", UserSchema);

/*var admin = new UserModel({username: "Naresh", password: "Naresh", email: "Naresh", firstName: "Naresh", lastName: "Aithagoni", roles: [admin]});
var student = new UserModel({username: "Razak", password: "Razak", email: "Razak", firstName: "Razak", lastName: "Shaik", roles: [student]});
admin.save();
student.save();*/

var app = express();

var index = require('./routes/index');
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var upload = multer(); // for parsing multipart/form-data
    app.use(session({
        secret: 'cookie_secret',
        resave: true,
        saveUninitialized: true
    }));
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());

app.use('/', index);
app.use('/users', users);


 passport.use(new LocalStrategy(function (username, password, done) {
     Employee.findOne({username: username, password: password}, function (err, user) {
             if (user)
             {
                 return done(null, user);
             }
             return done(null, false, {message: 'Unable to login'});
         });
 }));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.post("/login", passport.authenticate('local'), function (req, res) {
    /*console.log("/login");
    console.log(req.user);*/
     res.json(req.user);
});

app.post("/logout", function (req, res) {
    req.logOut();
    res.sendStatus(200);
});

app.get("/loggedin", function (req, res) {

    res.send(req.isAuthenticated() ? req.user : '0');
});

app.post("/signup", function (req, res) {
    Employee.findOne({username: req.body.username}, function (err, user) {
        if (user)
        {
            res.json(null);
            return;
        }
        else
        {
            var newUser = new Employee(req.body);
            newUser.roles = ['student'];
            newUser.save(function (err, user) {
                req.login(user, function (err) {
                    if (err)
                    {
                        return next(err);
                    }
                    res.json(user);
                });
               
            });
        }
    });
});

var auth = function (req, res, next) {
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.get("/rest/user", auth,function(req, res) {
    Employee.find(function (err, users) {
        res.json(users);
    });
});


app.get('/employees', function(req, res){
    Employee.find(function(err, contacts){
        if(err)
            res.send(err);
        res.json(contacts);
    });
});

app.get('/employees/:id', function(req, res){
    Employee.findOne({_id:req.params.id}, function(err, contact){
        if(err)
            res.send(err);
        res.json(contact);
    });
});
app.post('/employees', function(req, res){
    Employee.create( req.body, function(err, contacts){
        if(err)
            res.send(err);
        res.json(contacts);
    });
});


app.delete('/employees/:id', function(req, res){
    Employee.findOneAndRemove({_id:req.params.id}, function(err, contact){
        if(err)
            res.send(err);
        res.json(contact);
    });
});
app.put('/employees/:id', function(req, res){
    //var id = req.params._id;
    var query = {
        name:req.body.name,
        email:req.body.email,
        number:req.body.number
    }
    Employee.findOneAndUpdate({_id:req.params.id}, query, function(err, contact){
        if(err)
            res.send(err);
        res.json(contact);
    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
