const fetch = require('node-fetch'); // wait, fetch is global in Node 18+

async function run() {
    try {
        // login
        let res = await fetch('http://localhost:5005/api/users/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: 'mohan@gmail.com', password: 'password123'})
        });
        let data = await res.json();
        console.log('Login:', res.status, data.msg || 'Success');
        if (!data.token) return;

        // Add
        res = await fetch('http://localhost:5005/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': data.token
            },
            body: JSON.stringify({
                description: 'API Test',
                amount: 99,
                type: 'income'
            })
        });
        const text = await res.text();
        console.log('POST status:', res.status);
        console.log('POST response:', text);
    } catch (e) {
        console.log(e);
    }
}
run();
