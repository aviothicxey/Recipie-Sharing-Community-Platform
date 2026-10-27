const mongoose = require('mongoose');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Blog = require('../models/Blog');

const resourceMap = { users: User, recipes: Recipe, blogs: Blog };
const statusValues = {
    users: ['active', 'hidden'],
    recipes: ['published', 'hidden'],
    blogs: ['published', 'hidden'],
};

function getResource(name, res) {
    const Model = resourceMap[name];
    if (!Model) {
        res.status(404).json({ message: 'Unsupported admin resource' });
        return null;
    }
    return Model;
}

async function listResource(req, res, next) {
    try {
        const Model = getResource(req.params.resource, res);
        if (!Model) return;
        const projection = req.params.resource === 'users' ? '-passwordHash' : undefined;
        const defaultStatus = req.params.resource === 'users' ? 'active' : 'published';
        const records = await Model.find({}).select(projection).sort({ createdAt: -1 }).limit(200);
        return res.json(records.map((record) => {
            const item = record.toObject();
            return { ...item, status: item.status || defaultStatus };
        }));
    } catch (error) {
        return next(error);
    }
}

async function updateResourceStatus(req, res, next) {
    try {
        const { resource, id } = req.params;
        const Model = getResource(resource, res);
        if (!Model) return;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resource id' });
        if (!statusValues[resource].includes(req.body.status)) {
            return res.status(400).json({ message: `Status must be one of: ${statusValues[resource].join(', ')}` });
        }
        const updated = await Model.findByIdAndUpdate(id, { status: req.body.status }, { new: true, runValidators: true }).select('-passwordHash');
        if (!updated) return res.status(404).json({ message: 'Resource not found' });
        return res.json(updated);
    } catch (error) {
        return next(error);
    }
}

async function deleteResource(req, res, next) {
    try {
        const { resource, id } = req.params;
        const Model = getResource(resource, res);
        if (!Model) return;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resource id' });
        if (resource === 'users' && id === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete the signed-in administrator' });
        }
        const deleted = await Model.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Resource not found' });
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
}

module.exports = { listResource, updateResourceStatus, deleteResource };
