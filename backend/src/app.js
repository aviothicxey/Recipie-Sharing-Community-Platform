
const express = require('express');

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const blogRoutes = require('./routes/blog.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// CORS configuration
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        ...(process.env.FRONTEND_URL || '')
            .split(',')
            .map((origin) => origin.trim().replace(/\/+$/, ''))
            .filter(Boolean)
    ];

    const requestOrigin = req.headers.origin;

    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
});

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

// API health check
app.get('/', (req, res) => {
    res.json({ message: 'Recipe API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Debug endpoint
app.get('/debug-upload-route', (req, res) => {
    res.json({ message: 'App is loading the updated code' });
});

// Central error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation failed',
            errors: Object.values(err.errors).map(
                (error) => error.message
            )
        });
    }

    console.error(err);

    return res.status(err.statusCode || 500).json({
        message: err.statusCode
            ? err.message
            : 'Internal server error'
    });
});

module.exports = app;
