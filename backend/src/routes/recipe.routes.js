const express = require('express');
const requireAuth = require('../middleware/auth');
const {
    listRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe
} = require('../controllers/recipe.controller');




const router = express.Router();

router.get('/', listRecipes);
router.get('/:id', getRecipe);
router.post('/', requireAuth, createRecipe);
router.put('/:id', requireAuth, updateRecipe);
router.delete('/:id', requireAuth, deleteRecipe);

module.exports = router;