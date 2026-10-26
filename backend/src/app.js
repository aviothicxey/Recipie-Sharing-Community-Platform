const express = require('express');
const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const uploadRoutes = require('./routes/upload.routes');
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
});

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
    res.json({ message: 'Recipe API is running' });
})

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/debug-upload-route', (req, res) => {
    res.json({ message: 'App is loading the updated code' });
});

app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation failed',
            errors: Object.values(err.errors).map((error) => error.message)
        });
    }

    console.error(err);
    return res.status(err.statusCode || 500).json({
        message: err.statusCode ? err.message : 'Internal server error'
    });
});

module.exports = app;