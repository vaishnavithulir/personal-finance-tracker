async function probe() {
    const email = 'yogasriatshaya@gmail.com';
    const password = 'Yoga@123';
    const API = 'http://localhost:5005';

    try {
        // 1. Get Token
        console.log(`Authenticating ${email}...`);
        const logRes = await fetch(`${API}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!logRes.ok) {
            console.error('Authentication Failed:', await logRes.text());
            return;
        }

        const logData = await logRes.json();
        const token = logData.token;
        console.log('Token acquired.');

        // 2. Fetch Users
        console.log('Fetching institutional members...');
        const userRes = await fetch(`${API}/api/users`, {
            headers: { 'x-auth-token': token }
        });

        console.log('--- ADMIN_DATA_PROBE_RESULTS ---');
        console.log(`Status: ${userRes.status}`);
        const userData = await userRes.json();
        console.log(`Count: ${Array.isArray(userData) ? userData.length : 'N/A'} users found.`);
        console.log(JSON.stringify(userData, null, 2));
        console.log('--- END_PROBE ---');
    } catch (err) {
        console.error('PROBE_FAULT:', err.message);
    }
}

probe();
