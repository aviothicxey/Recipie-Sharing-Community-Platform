const mongoose = require('mongoose');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const BroadcastChannel = require('../models/BroadcastChannel');
const BroadcastMessage = require('../models/BroadcastMessage');
const Notification = require('../models/Notification');

function validId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function publicUser(user) {
    return { id: user._id, name: user.name, bio: user.bio, avatarUrl: user.avatarUrl };
}

async function listCreators(req, res, next) {
    try {
        const search = req.query.search?.trim();
        const channels = await BroadcastChannel.find().select('ownerId');
        const ownerIds = channels.map((channel) => channel.ownerId);
        const filter = { status: 'active', _id: { $in: ownerIds } };
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { bio: { $regex: search, $options: 'i' } }
        ];
        const creators = await User.find(filter)
            .select('name bio avatarUrl followers')
            .sort({ createdAt: -1 })
            .limit(50);
        return res.json(creators.map((creator) => ({
            ...publicUser(creator),
            followerCount: creator.followers.length,
            following: Boolean(req.user?.following?.some((id) => id.equals(creator._id))),
            isOwner: String(req.user?._id) === String(creator._id),
            hasChannel: true
        })));
    } catch (error) {
        return next(error);
    }
}

async function toggleFollow(req, res, next) {
    try {
        const { id } = req.params;
        if (!validId(id)) return res.status(400).json({ message: 'Invalid creator id' });
        if (String(req.user._id) === id) return res.status(400).json({ message: 'You cannot follow yourself' });

        const creator = await User.findOne({ _id: id, status: 'active' });
        if (!creator) return res.status(404).json({ message: 'Creator not found' });
        const alreadyFollowing = (req.user.following || []).some((userId) => userId.equals(creator._id));
        if (!req.user.following) req.user.following = [];
        if (alreadyFollowing) {
            req.user.following.pull(creator._id);
            creator.followers.pull(req.user._id);
        } else {
            req.user.following.addToSet(creator._id);
            creator.followers.addToSet(req.user._id);
        }
        await Promise.all([req.user.save(), creator.save()]);
        if (!alreadyFollowing) {
            await Notification.create({
                recipientId: creator._id,
                actorId: req.user._id,
                type: 'follow',
                text: `${req.user.name} followed you`
            });
        }
        return res.json({ following: !alreadyFollowing, followerCount: creator.followers.length });
    } catch (error) {
        return next(error);
    }
}

async function getChannel(req, res, next) {
    try {
        if (!validId(req.params.creatorId)) return res.status(400).json({ message: 'Invalid creator id' });
        const owner = await User.findOne({ _id: req.params.creatorId, status: 'active' }).select('name bio avatarUrl');
        if (!owner) return res.status(404).json({ message: 'Creator not found' });
        const isOwner = String(owner._id) === String(req.user._id);
        if (!isOwner && !(req.user.following || []).some((id) => id.equals(owner._id))) {
            return res.status(403).json({ message: 'Follow this creator to join their broadcast channel' });
        }
        const channel = await BroadcastChannel.findOne({ ownerId: owner._id }).populate('ownerId', 'name bio avatarUrl');
        if (!channel) return res.status(404).json({ message: 'This creator has not created a broadcast group' });
        const messages = await BroadcastMessage.find({ channelId: channel._id })
            .populate('authorId', 'name avatarUrl')
            .sort({ createdAt: -1 })
            .limit(50);
        return res.json({ channel, messages: messages.reverse() });
    } catch (error) {
        return next(error);
    }
}

async function getOwnChannel(req, res, next) {
    req.params.creatorId = req.user._id.toString();
    return getChannel(req, res, next);
}

async function createChannel(req, res, next) {
    try {
        const existing = await BroadcastChannel.findOne({ ownerId: req.user._id });
        if (existing) return res.status(409).json({ message: 'You already have a broadcast group' });
        const name = req.body.name?.trim();
        if (!name || name.length > 100) return res.status(400).json({ message: 'A group name between 1 and 100 characters is required' });
        const channel = await BroadcastChannel.create({
            ownerId: req.user._id,
            name,
            description: req.body.description?.trim() || ''
        });
        return res.status(201).json(channel);
    } catch (error) {
        return next(error);
    }
}

async function updateChannel(req, res, next) {
    try {
        const input = {};
        ['name', 'description', 'messageLimit', 'windowSeconds'].forEach((field) => {
            if (req.body[field] !== undefined) input[field] = req.body[field];
        });
        const channel = await BroadcastChannel.findOneAndUpdate(
            { ownerId: req.user._id },
            { $set: input },
            { returnDocument: 'after', runValidators: true }
        );
        if (!channel) return res.status(404).json({ message: 'Create your broadcast group before updating it' });
        return res.json(channel);
    } catch (error) {
        return next(error);
    }
}

async function postMessage(req, res, next) {
    try {
        if (!validId(req.params.creatorId)) return res.status(400).json({ message: 'Invalid creator id' });
        const text = req.body.text?.trim();
        if (!text || text.length > 1000) return res.status(400).json({ message: 'Message must be between 1 and 1000 characters' });
        const channel = await BroadcastChannel.findOne({ ownerId: req.params.creatorId });
        if (!channel) return res.status(404).json({ message: 'Broadcast channel not found' });
        const isOwner = String(channel.ownerId) === String(req.user._id);
        if (!isOwner && !(req.user.following || []).some((id) => id.equals(channel.ownerId))) {
            return res.status(403).json({ message: 'Follow this creator to join their broadcast channel' });
        }
        const since = new Date(Date.now() - channel.windowSeconds * 1000);
        const sent = await BroadcastMessage.countDocuments({ channelId: channel._id, authorId: req.user._id, createdAt: { $gte: since } });
        if (!isOwner && sent >= channel.messageLimit) {
            return res.status(429).json({ message: `Message limit reached. Try again after ${channel.windowSeconds} seconds.` });
        }
        const message = await BroadcastMessage.create({ channelId: channel._id, authorId: req.user._id, text });
        if (!isOwner) {
            await Notification.create({
                recipientId: channel.ownerId,
                actorId: req.user._id,
                type: 'message',
                text: `${req.user.name} sent a message in your broadcast group`
            });
        }
        return res.status(201).json(await message.populate('authorId', 'name avatarUrl'));
    } catch (error) {
        return next(error);
    }
}

async function listComments(req, res, next) {
    try {
        if (!validId(req.params.recipeId)) return res.status(400).json({ message: 'Invalid recipe id' });
        const comments = await Comment.find({ recipeId: req.params.recipeId })
            .populate('authorId', 'name avatarUrl')
            .sort({ createdAt: 1 });
        return res.json(comments);
    } catch (error) {
        return next(error);
    }
}

async function createComment(req, res, next) {
    try {
        if (!validId(req.params.recipeId)) return res.status(400).json({ message: 'Invalid recipe id' });
        const text = req.body.text?.trim();
        if (!text || text.length > 1000) return res.status(400).json({ message: 'Comment must be between 1 and 1000 characters' });
        const recipe = await Recipe.findOne({ _id: req.params.recipeId, status: { $ne: 'hidden' } }).select('authorId');
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        let parentId = req.body.parentId || null;
        if (parentId) {
            if (!validId(parentId)) return res.status(400).json({ message: 'Invalid parent comment id' });
            const parent = await Comment.findOne({ _id: parentId, recipeId: recipe._id });
            if (!parent) return res.status(404).json({ message: 'Parent comment not found' });
        }
        const comment = await Comment.create({ recipeId: recipe._id, authorId: req.user._id, parentId, text });
        if (String(recipe.authorId) !== String(req.user._id)) {
            await Notification.create({
                recipientId: recipe.authorId,
                actorId: req.user._id,
                type: 'comment',
                text: `${req.user.name} commented on your recipe`
            });
        }
        return res.status(201).json(await comment.populate('authorId', 'name avatarUrl'));
    } catch (error) {
        return next(error);
    }
}

async function listNotifications(req, res, next) {
    try {
        const notifications = await Notification.find({ recipientId: req.user._id })
            .populate('actorId', 'name avatarUrl')
            .sort({ createdAt: -1 })
            .limit(50);
        return res.json(notifications);
    } catch (error) {
        return next(error);
    }
}

async function markNotificationsRead(req, res, next) {
    try {
        await Notification.updateMany({ recipientId: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    listCreators, toggleFollow, getChannel, getOwnChannel, createChannel, updateChannel, postMessage,
    listComments, createComment, listNotifications, markNotificationsRead
};
