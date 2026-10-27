const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
        category: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true, maxlength: 180 },
        excerpt: { type: String, required: true, trim: true, maxlength: 500 },
        date: { type: String, required: true, trim: true },
        image: { type: String, required: true, trim: true },
        body: { type: String, default: '' },
        status: { type: String, enum: ['published', 'hidden'], default: 'published' },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Blog', blogSchema);
