const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../db');

// Middleware for token verification
const auth = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        // Ensure user exists in platform vault
        const user = await prisma.user.findUnique({ where: { id: decoded.user.id } });
        if (!user) return res.status(401).json({ msg: 'Account not found' });

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route    GET api/transactions
// @desc     Get transactions (All for Admin, own for User)
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
        let transactions;
        if (req.user.role && req.user.role.toLowerCase() === 'admin') {
            transactions = await prisma.transaction.findMany({
                include: {
                    user: { select: { fullName: true, email: true } },
                    category: true
                },
                orderBy: { date: 'desc' }
            });
        } else {
            transactions = await prisma.transaction.findMany({
                where: { userId: req.user.id },
                include: { category: true },
                orderBy: { date: 'desc' }
            });
        }
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route    GET api/transactions/categories
// @desc     Get all categories for user
// @access   Private
router.get('/categories', auth, async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { userId: req.user.id }
        });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route    POST api/transactions
// @desc     Add new transaction
// @access   Private
router.post('/', auth, async (req, res) => {
    try {
        const { description, amount, type, category, categoryId, date } = req.body;
        const transaction = await prisma.transaction.create({
            data: {
                description,
                amount: parseFloat(amount),
                type: type || 'expense',
                legacyCategory: category || 'Other',
                categoryId: categoryId || null,
                date: date ? new Date(date) : new Date(),
                userId: req.user.id
            },
            include: { category: true }
        });

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message });
    }
});

// @route    PUT api/transactions/:id
// @desc     Edit a transaction (User can only edit own)
// @access   Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { description, amount, type, category, date } = req.body;

        // If Admin, they can edit anything. If User, only their own.
        let existing;
        if (req.user.role && req.user.role.toLowerCase() === 'admin') {
            existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
        } else {
            existing = await prisma.transaction.findFirst({
                where: { id: req.params.id, userId: req.user.id }
            });
        }

        if (!existing) {
            return res.status(404).json({ msg: 'Transaction not found or unauthorized' });
        }

        const updated = await prisma.transaction.update({
            where: { id: req.params.id },
            data: {
                description: description || existing.description,
                amount: amount ? parseFloat(amount) : existing.amount,
                type: type || existing.type,
                legacyCategory: category || existing.legacyCategory,
                date: date ? new Date(date) : existing.date
            }
        });

        res.json(updated);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message });
    }
});

// @route    DELETE api/transactions/:id
// @desc     Delete a transaction (User can only delete own)
// @access   Private
router.delete('/:id', auth, async (req, res) => {
    try {
        // If Admin, they can delete anything. If User, only their own.
        let existing;
        if (req.user.role && req.user.role.toLowerCase() === 'admin') {
            existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
        } else {
            existing = await prisma.transaction.findFirst({
                where: { id: req.params.id, userId: req.user.id }
            });
        }

        if (!existing) {
            return res.status(404).json({ msg: 'Transaction not found or unauthorized' });
        }

        await prisma.transaction.delete({ where: { id: req.params.id } });
        res.json({ msg: 'Transaction deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
