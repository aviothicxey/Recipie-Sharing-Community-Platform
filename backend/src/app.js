const express = require('express');
const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const blogRoutes = require('./routes/blog.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const app = express();

app.use((req, res, next) => {
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    const requestOrigin = req.headers.origin;
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        res.header('Access-Control-Allow-Origin', requestOrigin);
    }
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
});

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
    res.json({ message: 'Recipe API is running' });
})

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

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