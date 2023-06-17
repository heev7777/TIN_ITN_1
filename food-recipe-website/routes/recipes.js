const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');

function ensureAuthenticated(req, res, next) {
  console.log('ensureAuthenticated middleware');
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/users/login');
}

// Create a new recipe
router.post(
  '/',
  ensureAuthenticated,  // use the middleware here
  [
    check('name', 'Name is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('ingredients', 'Ingredients are required').not().isEmpty(),
    check('instructions', 'Instructions are required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, title, ingredients, instructions, isPublic } = req.body;

    try {
      let recipe = new Recipe({
        name,
        title,
        ingredients,
        instructions,
        isPublic: isPublic === 'on'
      });

      await recipe.save();

      // Get user and add recipe to user's recipes array
      let user = await User.findById(req.user.id);
      user.recipes.push(recipe.id);
      await user.save();

      res.redirect('/recipes/dashboard');  // redirect here after saving the recipe
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Dashboard route
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).populate('recipes'); // add populate('recipes') here
    res.render('dashboard', { user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/add-recipe', ensureAuthenticated, (req, res) => {
  res.render('add-recipe', { user: req.user });
});

router.get('/public', async (req, res) => {
  try {
    let recipes = await Recipe.find({ isPublic: true });
    res.render('public-recipes', { recipes }); // Create a new EJS file for this view
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Update a recipe
router.put('/:id', ensureAuthenticated, async (req, res) => {
  const { name, ingredients, instructions } = req.body;

  const recipeFields = {};
  if (name) recipeFields.name = name;
  if (ingredients) recipeFields.ingredients = ingredients;
  if (instructions) recipeFields.instructions = instructions;

  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ msg: 'Recipe not found' });

    recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: recipeFields },
      { new: true }
    );

    req.flash('success_msg', 'Recipe updated successfully');
    res.redirect('/recipes/dashboard');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a recipe
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ msg: 'Recipe not found' });

    await Recipe.findByIdAndRemove(req.params.id);

    req.flash('success_msg', 'Recipe removed successfully');
    res.redirect('/recipes/dashboard');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ msg: 'Recipe not found' });

    res.render('edit-recipe', { recipe }); // Make sure to create a 'edit-recipe.ejs' file in your views folder
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) return res.status(404).json({ msg: 'Recipe not found' });

    res.render('recipe-detail', { recipe }); // Make sure to create a 'recipe-detail.ejs' file in your views folder
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
