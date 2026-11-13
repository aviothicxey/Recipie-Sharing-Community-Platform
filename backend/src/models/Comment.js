const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true, index: true },
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
        text: { type: String, required: true, trim: true, maxlength: 1000 }
    },
    { timestamps: true }
);

commentSchema.index({ recipeId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
