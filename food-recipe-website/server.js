require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const { check, validationResult } = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

const users = require('./routes/users');
const recipes = require('./routes/recipes');
const addRecipe = require('./routes/recipes');
const db = require('./config/keys').MongoURI;


const app = express();

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Passport config
require('./passport-config')(passport); // replace './passport-config'


// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

app.use(methodOverride('_method'));

app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('User:', req.user);
  next();
});

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.user || null;
  next();
});


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});

app.get('/', function(req, res) {
  res.render('home', { user: req.user });
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/users', users);
app.use('/recipes', recipes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
