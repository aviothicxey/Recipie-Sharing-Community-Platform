const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
    try {
        const header = req.get('Authorization');
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is not configured' });
        }

        const token = header.slice(7);
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.userId === 'configured-admin' && payload.role === 'admin') {
            req.user = { _id: payload.userId, name: 'Administrator', role: 'admin' };
            return next();
        }

        const user = await User.findById(payload.userId).select('_id name email role status');

        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        req.user = user;
        return next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        return next(error);
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Administrator access required' });
    }
    return next();
}

module.exports = requireAuth;
module.exports.requireAdmin = requireAdmin;