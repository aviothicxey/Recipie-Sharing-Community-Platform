const jwt = require('jsonwebtoken');
const { clerkClient, getAuth } = require('@clerk/express');
const User = require('../models/User');

async function findClerkUser(clerkUserId) {
    const existing = await User.findOne({ clerkUserId });
    if (existing) return existing;

    const account = await clerkClient.users.getUser(clerkUserId);
    const email = account.primaryEmailAddress;
    if (account.banned || email?.verification?.status !== 'verified') {
        throw Object.assign(new Error('An active account with a verified email is required'), { statusCode: 403 });
    }

    try {
        return await User.findOneAndUpdate(
            { clerkUserId },
            {
                $setOnInsert: {
                    email: email.emailAddress.trim().toLowerCase(),
                    name: ([account.firstName, account.lastName].filter(Boolean).join(' ').trim() || email.emailAddress.split('@')[0]).slice(0, 80),
                    avatarUrl: account.imageUrl,
                },
            },
            { upsert: true, returnDocument: 'after', runValidators: true },
        );
    } catch (error) {
        if (error.code !== 11000) throw error;
        const provisioned = await User.findOne({ clerkUserId });
        if (provisioned) return provisioned;
        throw Object.assign(new Error('This email belongs to an existing DishCircle account. Sign in with your original method.'), { statusCode: 409 });
    }
}

async function requireAuth(req, res, next) {
    try {
        const header = req.get('Authorization');
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (req.auth) {
            const { userId } = getAuth(req);
            if (!userId) return res.status(401).json({ message: 'Invalid or expired Clerk session' });

            const user = await findClerkUser(userId);
            if (user.status === 'hidden') return res.status(403).json({ message: 'This account has been suspended' });
            req.user = user;
            return next();
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is not configured' });
        }

        const token = header.slice(7);
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        if (payload.userId === 'configured-admin' && payload.role === 'admin') {
            req.user = { _id: payload.userId, name: 'Administrator', role: 'admin' };
            return next();
        }

        const user = await User.findById(payload.userId);

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
