const prisma = require('./db');
const bcrypt = require('bcryptjs');

async function check() {
    const user = await prisma.user.findUnique({ where: { email: 'mohan@gmail.com' } });
    if (!user) {
        console.log('Mohan not found');
        return;
    }
    console.log('User found:', user.email);
    console.log('Hashed Password:', user.password);
    
    // Check if it's plain text or hashed
    const isActuallyHashed = user.password.startsWith('$2');
    console.log('Looks hashed?', isActuallyHashed);
    
    const possiblePasswords = ['admin123', 'password', 'mohan123', 'admin'];
    for(const p of possiblePasswords) {
        const match = await bcrypt.compare(p, user.password);
        if(match) console.log('MATCH FOUND! Password is:', p);
    }
}

check().catch(console.error);
