const express = require('express');

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5005;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));
app.use(express.json());

// Database Connection (Prisma is handled in routes)
console.log('SQL Database (via Prisma) initialized...');

// Routes
app.use('/api/users', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => {
  res.send('Finance Tracker API is running');
});

app.get('/health', async (req, res) => {
  try {
    const userCount = await require('./db').user.count();
    res.json({ status: 'ok', database: 'connected', userCount });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
