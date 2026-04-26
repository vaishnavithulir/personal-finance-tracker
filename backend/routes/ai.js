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
            // Enhanced Dynamic Mock Advisor
            const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const netBalance = incomeTotal - expenseTotal;
            const savingsRate = incomeTotal > 0 ? ((netBalance / incomeTotal) * 100).toFixed(1) : 0;

            // Group expenses by category
            const categories = {};
            transactions.filter(t => t.type === 'expense').forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });
            const topCategories = Object.entries(categories)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

            const tips = [];
            if (topCategories.length > 0) {
                topCategories.forEach(([cat, amt]) => {
                    if (cat.toLowerCase().includes('food') || cat.toLowerCase().includes('dining')) {
                        tips.push(`Your ${cat} expenditure (₹${amt.toLocaleString()}) is high; consider meal prepping to save 20% next month.`);
                    } else if (cat.toLowerCase().includes('shop') || cat.toLowerCase().includes('cloth')) {
                        tips.push(`Allocating ₹${amt.toLocaleString()} to ${cat} represents a significant leak; try the 24-hour rule before purchasing non-essentials.`);
                    } else if (cat.toLowerCase().includes('rent') || cat.toLowerCase().includes('bill')) {
                        tips.push(`Your fixed costs for ${cat} are stable. Monitoring utility patterns could reveal subtle optimization areas.`);
                    } else {
                        tips.push(`Strategic review of your ${cat} allocations (₹${amt.toLocaleString()}) could unlock hidden liquidity.`);
                    }
                });
            }

            // Fill up to 3 tips
            if (tips.length < 3) tips.push("Implement the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.");
            if (tips.length < 3) tips.push("Your institutional health index is improving. Continue tracking every signal.");
            if (tips.length < 3) tips.push("Diversifying your liquidity into low-risk bonds could normalize your yield curve.");

            let summary = `Based on your recent ${transactions.length} institutional signals, your vault has processed ₹${expenseTotal.toLocaleString()} in outflows. `;
            if (savingsRate > 20) {
                summary += `Excellent! Your savings rate is ${savingsRate}%, which is well above the institutional baseline.`;
            } else if (savingsRate > 0) {
                summary += `Your current savings rate is ${savingsRate}%. There is significant room to optimize your capital retention.`;
            } else {
                summary += `Warning: Your expenditure exceeds accumulation by ₹${Math.abs(netBalance).toLocaleString()}. Immediate strategy realignment is required.`;
            }

            return res.json({
                summary,
                tips: tips.slice(0, 3),
                encouragement: netBalance > 0 
                    ? "Financial dominance achieved for this cycle. Keep the momentum high." 
                    : "Every master was once a beginner. Realignment starts with your next transaction."
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
// @desc     Real-time AI Chat Concierge / Advisor (Optionally Private)
// @access   Public/Private
router.post('/alpha-advice', async (req, res) => {
    try {
        const token = req.header('x-auth-token');
        let user = null;
        let transactions = [];

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                user = decoded.user;
                transactions = await prisma.transaction.findMany({
                    where: { userId: user.id },
                    orderBy: { date: 'desc' },
                    take: 20
                });
            } catch (err) {
                // Invalid token, proceed as guest
            }
        }

        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            const query = (message || "").toLowerCase();
            let advice = "My neural nodes are synchronizing with your vault. I am ready to optimize your capital distribution.";
            
            if (query.includes("how") || query.includes("work") || query.includes("demo") || query.includes("video") || query.includes("feature")) {
                advice = "Dumbo Finance is an institutional-grade Personal Finance Tracker. Use your Dashboard to visualize wealth nodes, or leverage my Zenith AI engine for predictive strategy optimization. Your vault is secured with military-grade Neural ID encryption.";
            } else if (query.includes("balance") || query.includes("total") || query.includes("much")) {
                const total = transactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
                advice = `Your current institutional balance is ₹${total.toLocaleString('en-IN')}. This represents your high-liquidity holdings within the Dumbo vault.`;
            } else if (query.includes("save") || query.includes("saving") || query.includes("invest")) {
                advice = "I recommend reallocating 15% of your stagnant liquidity into low-volatility institutional bonds to optimize your yield curve.";
            } else if (query.includes("spent") || query.includes("spending") || query.includes("expense")) {
                const spent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                advice = `Institutional outflows currently peak at ₹${spent.toLocaleString('en-IN')}. I suggest reviewing your recurring resource allocations to minimize capital leakage.`;
            } else if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
                advice = "Greetings. I am the Dumbo Finance Advisor. Your vault signals are clear. How shall we optimize your strategy today?";
            } else if (query.includes("who") || query.includes("name")) {
                advice = "I am the Dumbo Finance Advisor, an autonomous wealth management node powered by Zenith Intelligence.";
            } else if (transactions.length === 0) {
                advice = "Welcome to your new vault. Currently, no transactions have been logged. I recommend synchronizing your bank statement to initiate my predictive modeling engine.";
            } else {
                advice = `Strategy Note: Based on your recent ${transactions.length} signals, I recommend maintaining your current liquidity position while we monitor for growth opportunities.`;
            }

            return res.json({ advice });
        }

        // Live Gemini Logic
        const hasData = transactions.length > 0;
        const dataStr = hasData ? transactions.map(t => `${t.type}: ₹${t.amount} (${t.category})`).join('\n') : "Guest Signal: No transaction ledger available.";
        
        const prompt = `
            Context: You are the 'Dumbo Finance Advisor', a smart personal finance tracker.
            User Query: "${message}"
            ${hasData ? `Recent Transactions:\n${dataStr}` : "Note: This is a prospective member. They have not yet synchronized their bank vault."}
            
            Instructions: 
            1. You are the digital narrator for the Dumbo Finance application. 
            2. If the user is a prospective member (no transactions), explain the platform like a cinematic walkthrough. Highlight the Dashboard, Zenith AI Predictions, and Military-grade Vault Security.
            3. If they are an active member (transactions provided), respond professionally and intelligently using their specific data.
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
