const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    excerpt: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    image: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BlogPost', blogPostSchema);
