const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function elevateUser() {
    const email = 'yogasriatshayak@gmail.com';
    const password = 'Yoga@123';
    
    try {
        console.log(`Elevating identity to Administrative status: ${email}...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'Admin'
            },
            create: {
                fullName: 'Atshaya (Admin)',
                email: email,
                password: hashedPassword,
                role: 'Admin'
            }
        });

        console.log('--- ADMINISTRATIVE_ELEVATION_SUCCESS ---');
        console.log(`Identity: ${user.email}`);
        console.log(`New Clearance Level: ${user.role}`);
        console.log(`Vault permissions updated successfully.`);
        console.log('--- END_PROTOCOL ---');

    } catch (err) {
        console.error('ELEVATION_FAULT:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

elevateUser();
