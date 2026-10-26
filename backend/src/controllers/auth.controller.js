const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(userId, role = 'user') {
    if (!process.env.JWT_SECRET) {
        const error = new Error('JWT_SECRET is not configured');
        error.statusCode = 500;
        throw error;
    }

    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
    return { id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, avatarUrl: user.avatarUrl };
}

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password || password.length < 8) {
            return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await User.create({ name, email: normalizedEmail, passwordHash });
        return res.status(201).json({ token: createToken(user._id.toString(), user.role), user: publicUser(user) });
    } catch (error) {
        return next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
        const validPassword = user && await bcrypt.compare(password || '', user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        return res.json({ token: createToken(user._id.toString(), user.role), user: publicUser(user) });
    } catch (error) {
        return next(error);
    }
}

async function adminLogin(req, res, next) {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();

        if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
            const validAdmin = normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase().trim()
                && await bcrypt.compare(password || '', process.env.ADMIN_PASSWORD_HASH);
            if (!validAdmin) {
                return res.status(401).json({ message: 'Invalid admin email or password' });
            }

            return res.json({
                token: createToken('configured-admin', 'admin'),
                user: { id: 'configured-admin', name: 'Administrator', email: normalizedEmail, role: 'admin' },
            });
        }

        const user = await User.findOne({ email: normalizedEmail, role: 'admin' }).select('+passwordHash');
        const validPassword = user && await bcrypt.compare(password || '', user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid admin email or password' });
        }

        return res.json({ token: createToken(user._id.toString(), 'admin'), user: publicUser(user) });
    } catch (error) {
        return next(error);
    }
}

module.exports = { register, login, adminLogin };
