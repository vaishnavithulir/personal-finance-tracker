const prisma = require('./db');
const bcrypt = require('bcryptjs');

async function fix() {
    const salt = await bcrypt.genSalt(10);
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await prisma.user.update({
        where: { email: 'mohan@gmail.com' },
        data: { password: hashedPassword, role: 'Admin' }
    });
    
    console.log('Fixed Mohan! Password is set to admin123');
}

fix().catch(console.error);
