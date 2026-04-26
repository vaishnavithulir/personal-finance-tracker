const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetAdmin() {
    const email = 'yogasriatshaya@gmail.com';
    const password = 'Yoga@123';
    
    try {
        console.log(`Searching for Admin identity: ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'Admin'
            },
            create: {
                fullName: 'Yogasri Atshaya Kasiraman',
                email: email,
                password: hashedPassword,
                role: 'Admin'
            }
        });

        console.log('--- ADMIN_RESTORE_SUCCESS ---');
        console.log(`Identity: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`New Key Hash Deployed successfully.`);
        console.log('--- END_PROTOCOL ---');

    } catch (err) {
        console.error('RESTORE_FAULT:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
