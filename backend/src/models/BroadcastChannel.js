const mongoose = require('mongoose');

const broadcastChannelSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        name: { type: String, required: true, trim: true, maxlength: 100 },
        description: { type: String, trim: true, maxlength: 500, default: '' },
        messageLimit: { type: Number, min: 1, max: 100, default: 5 },
        windowSeconds: { type: Number, min: 10, max: 86400, default: 3600 }
    },
    { timestamps: true }
);

module.exports = mongoose.model('BroadcastChannel', broadcastChannelSchema);
