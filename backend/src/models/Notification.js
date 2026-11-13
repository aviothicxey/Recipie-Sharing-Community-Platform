const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['follow', 'comment', 'message'], required: true },
        text: { type: String, required: true, trim: true, maxlength: 300 },
        readAt: { type: Date, default: null }
    },
    { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
