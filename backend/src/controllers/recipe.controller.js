const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

const pageSize = 12;

function makeSlug(title) {
    return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function encodeCursor(recipe) {
    return Buffer.from(JSON.stringify({ createdAt: recipe.createdAt, id: recipe._id })).toString('base64url');
}

function decodeCursor(value) {
    try {
        return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    } catch {
        const error = new Error('Invalid cursor');
        error.statusCode = 400;
        throw error;
    }
}

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function recipeInput(body) {
    const allowedFields = [
        'title', 'description', 'coverUrl', 'cuisine', 'diet', 'cookTime',
        'servings', 'difficulty', 'tags', 'ingredients', 'steps'
    ];
    return allowedFields.reduce((input, field) => {
        if (body[field] !== undefined) input[field] = body[field];
        return input;
    }, {});
}

async function listRecipes(req, res, next) {
    try {
        const { cuisine, diet, maxTime, difficulty, search, cursor } = req.query;
        const filter = {};
        if (cuisine) filter.cuisine = cuisine.toLowerCase();
        if (diet) filter.diet = diet.toLowerCase();
        if (difficulty) filter.difficulty = difficulty.toLowerCase();
        if (maxTime) filter.cookTime = { $lte: Number(maxTime) };
        if (search) filter.$text = { $search: search };

        if (cursor) {
            const decoded = decodeCursor(cursor);
            filter.$or = [
                { createdAt: { $lt: new Date(decoded.createdAt) } },
                { createdAt: new Date(decoded.createdAt), _id: { $lt: decoded.id } }
            ];
        }

        const query = Recipe.find(filter).populate('authorId', 'name avatarUrl').sort({ createdAt: -1, _id: -1 }).limit(pageSize + 1);
        if (search) query.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' }, createdAt: -1 });

        const recipes = await query;
        const hasMore = recipes.length > pageSize;
        if (hasMore) recipes.pop();
        return res.json({ data: recipes, nextCursor: hasMore ? encodeCursor(recipes[recipes.length - 1]) : null });
    } catch (error) {
        return next(error);
    }
}

async function getRecipe(req, res, next) {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe id' });
        const recipe = await Recipe.findById(req.params.id).populate('authorId', 'name avatarUrl');
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        return res.json(recipe);
    } catch (error) {
        return next(error);
    }
}

async function createRecipe(req, res, next) {
    try {
        const input = recipeInput(req.body);
        const recipe = await Recipe.create({ ...input, authorId: req.user._id, slug: makeSlug(input.title || '') });
        return res.status(201).json(recipe);
    } catch (error) {
        return next(error);
    }
}

async function updateRecipe(req, res, next) {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe id' });
        const updates = recipeInput(req.body);
        if (updates.title) updates.slug = makeSlug(updates.title);
        const recipe = await Recipe.findOneAndUpdate({ _id: req.params.id, authorId: req.user._id }, updates, { new: true, runValidators: true });
        if (!recipe) return res.status(404).json({ message: 'Recipe not found or not owned by you' });
        return res.json(recipe);
    } catch (error) {
        return next(error);
    }
}

async function deleteRecipe(req, res, next) {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid recipe id' });
        const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, authorId: req.user._id });
        if (!recipe) return res.status(404).json({ message: 'Recipe not found or not owned by you' });
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
}


module.exports = { listRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe };