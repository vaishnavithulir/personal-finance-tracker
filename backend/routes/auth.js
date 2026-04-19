const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

// Auth middleware (reused across routes)
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        let user = await prisma.user.findUnique({ where: { email } });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await prisma.user.create({
            data: { fullName, email, password: hashedPassword }
        });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1000h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/users/login
// @desc    Authenticate user and return token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1000h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/users
// @desc    Get all users — Admin only
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user.role || req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                bankName: true,
                accountNumber: true,
                ifscCode: true,
                createdAt: true,
                _count: { select: { transactions: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/users/profile
// @desc    Get user profile data
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                fullName: true,
                email: true,
                role: true,
                bankName: true,
                accountNumber: true,
                ifscCode: true
            }
        });

        if (!user) {
            return res.status(404).json({ msg: 'User profile not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', auth, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ msg: 'Password must be at least 8 characters long' });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/users/forgot-password
// @desc    Reset password (Forgot Password flow)
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ msg: 'Account not found with this email entity' });

        if (!password || password.length < 8) {
            return res.status(400).json({ msg: 'New Key must be at least 8 characters' });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        res.json({ msg: 'Access Key reset successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
