const mongoose = require('mongoose');

const broadcastMessageSchema = new mongoose.Schema(
    {
        channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'BroadcastChannel', required: true, index: true },
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true, trim: true, maxlength: 1000 }
    },
    { timestamps: true }
);

broadcastMessageSchema.index({ channelId: 1, createdAt: -1 });

module.exports = mongoose.model('BroadcastMessage', broadcastMessageSchema);
