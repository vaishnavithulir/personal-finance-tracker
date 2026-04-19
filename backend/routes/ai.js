const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../db');

// Middleware for token verification
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

// @route    POST api/ai/advice
// @desc     Get AI financial advice based on transactions
// @access   Private
router.post('/advice', auth, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id },
            orderBy: { date: 'desc' },
            take: 50
        });
        
        if (transactions.length === 0) {
            return res.json({ 
                summary: "You don't have enough transactions yet for a detailed analysis.",
                tips: ["Start by adding your first expense", "Add your monthly income", "Set a budget goal"],
                encouragement: "The first step to financial freedom is tracking. Start today!"
            });
        }

        const dataStr = transactions.map(t => `${t.type}: ₹${t.amount} (${t.category} - ${t.description})`).join('\n');
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Institutional Mock Advisor Fallback
            const incomeCount = transactions.filter(t => t.type === 'income').length;
            const expenseCount = transactions.filter(t => t.type === 'expense').length;
            const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

            return res.json({
                summary: `Based on your recent ${transactions.length} institutional signals, your cash flow is currently weighted towards ${expenseCount > incomeCount ? 'expenditure' : 'accumulation'}. Total platform outflow detected at ₹${totalSpent.toLocaleString()}.`,
                tips: [
                    "Diversify your institutional dividend portfolio to mitigate sector volatility.",
                    "Review high-recurring SaaS subscriptions (AWS/Google) for idle resource costs.",
                    "Optimize your monthly tax-saving instruments before the quarter ends."
                ],
                encouragement: "Your institutional footprint is growing. Strategic monitoring today leads to financial dominance tomorrow."
            });
        }

        const prompt = `
            You are a professional financial advisor. Analyze the following Recent transactions for a user and provide:
            1. A brief summary of their spending habits.
            2. Three actionable tips to save money or invest better.
            3. A morale boost or encouragement.

            Format the response as a JSON object with this structure:
            {
               "summary": "...",
               "tips": ["tip1", "tip2", "tip3"],
               "encouragement": "..."
            }

            Transactions:
            ${dataStr}
        `;

        const https = require('https');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const postData = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const aiReq = https.request(url, options, (aiRes) => {
            let responseData = '';
            aiRes.on('data', (chunk) => { responseData += chunk; });
            aiRes.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    
                    if (result.error) {
                        return res.status(aiRes.statusCode || 500).json({ 
                            msg: 'AI Platform Error', 
                            detail: result.error.message || 'Unknown error' 
                        });
                    }

                    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0].text) {
                        let aiText = result.candidates[0].content.parts[0].text;
                        
                        // Robust JSON extraction
                        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            try {
                                res.json(JSON.parse(jsonMatch[0].trim()));
                            } catch (innerError) {
                                res.status(500).json({ msg: 'AI returned malformed JSON', raw: aiText });
                            }
                        } else {
                            res.status(500).json({ msg: 'No JSON found in AI response', raw: aiText });
                        }
                    } else {
                        res.status(500).json({ msg: 'AI response was invalid or empty', detail: result });
                    }
                } catch (e) {
                    res.status(500).json({ msg: 'Error parsing raw response from AI service', error: e.message });
                }
            });
        });

        aiReq.on('error', (e) => {
            res.status(500).json({ msg: 'AI Connection Error (Outbound)', error: e.message });
        });

        aiReq.write(postData);
        aiReq.end();

    } catch (err) {
        console.error('AI Route Error:', err);
        res.status(500).json({ msg: 'Internal Server Error during AI analysis', detail: err.message });
    }
});

// @route    POST api/ai/alpha-advice
// @desc     Real-time AI Chat Concierge / Advisor
// @access   Private
router.post('/alpha-advice', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id },
            orderBy: { date: 'desc' },
            take: 20
        });

        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            // Intelligent Keyword-Based Mock Response
            const query = (message || "").toLowerCase();
            let advice = "Your institutional wealth footprint is stable. I am monitoring your liquidity nodes.";
            
            if (query.includes("how") || query.includes("work") || query.includes("demo") || query.includes("video") || query.includes("application") || query.includes("feature")) {
                advice = "Dumbo Finance is an institutional-grade Personal Finance Tracker. The Dashboard visualizes your global wealth nodes, while my Zenith AI engine provides 5-year predictive modeling and proactive strategy optimization. Your assets are secured within our proprietary digital vault, accessible only through your Neural ID.";
            } else if (query.includes("balance") || query.includes("total") || query.includes("much")) {
                const total = transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
                advice = `Your current institutional balance is approximately ₹${total.toLocaleString()}. This represents your high-liquidity holdings within the vault.`;
            } else if (query.includes("save") || query.includes("saving") || query.includes("investment")) {
                advice = "I recommend moving 15% of your stagnant liquidity into low-volatility institutional bonds to optimize your yield curve.";
            } else if (query.includes("expense") || query.includes("spending") || query.includes("spent")) {
                const spent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                advice = `You have directed ₹${spent.toLocaleString()} towards platform expenses recently. I suggest reviewing your recurring resource allocations to minimize leakage.`;
            } else if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
                advice = "Greetings. I am the Dumbo Finance Advisor. I have analyzed your vault signals and am ready to optimize your strategy.";
            } else if (query.includes("who") || query.includes("name")) {
                advice = "I am the Dumbo Finance Advisor, a Smart Personal Finance Tracker & Advisor node powered by Zenith Intelligence.";
            } else if (query.length > 0) {
                advice = `I have received your query regarding "${message}". Based on your recent ${transactions.length} transactions, I recommend maintaining your current strategic position while monitoring for growth opportunities.`;
            }

            return res.json({ advice });
        }

        // Live Gemini Logic
        const dataStr = transactions.map(t => `${t.type}: ₹${t.amount} (${t.category})`).join('\n');
        const prompt = `
            Context: You are the 'Dumbo Finance Advisor', a smart personal finance tracker.
            User Query: "${message}"
            Recent Transactions:
            ${dataStr}
            
            Instructions: 
            1. You are the digital narrator for the Dumbo Finance application. 
            2. If asked about how the app works, the video, or features, explain it like a cinematic walkthrough (Mention Dashboard, Zenith AI Predictions, and Vault Security).
            3. Respond professionally and intelligently to all financial queries using their transaction data.
            4. Keep responses concise (max 3-4 sentences).
        `;

        const https = require('https');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const postData = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });

        const aiReq = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (aiRes) => {
            let body = '';
            aiRes.on('data', d => body += d);
            aiRes.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "Vault synchronization complete. Your strategic outlook remains positive.";
                    res.json({ advice: text });
                } catch(e) { res.json({ advice: "My neural nodes are synchronizing. Please repeat the query." }); }
            });
        });
        aiReq.write(postData);
        aiReq.end();

    } catch (err) {
        res.status(500).json({ msg: 'Advisor Node Offline', error: err.message });
    }
});

module.exports = router;
