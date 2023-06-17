const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const flash = require('connect-flash');

function ensureAuthenticated(req, res, next) {
  console.log('ensureAuthenticated middleware');
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

// User Registration
router.get('/register', (req, res) => {
  res.render('register', { user: req.user });
});

router.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

router.get('/', function(req, res) {
  res.render('home', { user: req.user });
});

router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    // Populate the user's recipes and favorites
    let user = await User.findById(req.user.id).populate('recipes').populate('favorites');
    res.render('dashboard', { user: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors.array().map(error => error.msg);
      req.flash('error_msg', messages.join(' '));
      return res.redirect('/users/register');
    }

    const { name, email, password, username } = req.body;
  
    try {
      let user = await User.findOne({ email });
  
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }
            
      let userWithUsername = await User.findOne({ username });
      if (userWithUsername) {
        return res.status(400).json({ errors: [{ msg: 'Username is already in use' }] });
      }
  
      user = new User({
        name,
        username,
        email,
        password
      });
  
      const salt = await bcrypt.genSalt(10);
  
      user.password = await bcrypt.hash(password, salt);
  
      await user.save();
  
      req.flash('success_msg', 'You are now registered and can log in');
      res.redirect('/recipes/dashboard');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

// User Login
router.post('/login', (req, res, next) => {
  console.log('Login Request:', req.body);
  const { email, password } = req.body;
  console.log('Email:', email);
  console.log('Password:', password);
  passport.authenticate('local', (err, user, info) => {
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error_msg', info.message);
      return res.redirect('/users/login');
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/recipes/dashboard');
    });
  })(req, res, next);
});



// User Logout
router.get('/logout', function(req, res){
  req.session.destroy(function (err) {
    res.redirect('/users/login'); //THX STACKOVERFLOW
  });
});
module.exports = router;
