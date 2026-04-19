const prisma = require('./db');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('--- Initializing Dumbo Finance Seed Process ---');

    const users = [
        {
            fullName: 'Dumbo Administrator',
            email: 'official-admin@dumbo.com',
            password: 'admin123',
            role: 'Admin'
        },
        {
            fullName: 'Dumbo Standard User',
            email: 'official-user@dumbo.com',
            password: 'user123',
            role: 'User'
        }
    ];

    for (const u of users) {
        let user = await prisma.user.findUnique({ where: { email: u.email } });
        
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.password, salt);

            user = await prisma.user.create({
                data: {
                    fullName: u.fullName,
                    email: u.email,
                    password: hashedPassword,
                    role: u.role
                }
            });
            console.log(`Created ${u.role}: ${u.email} [Password: ${u.password}]`);
        } else {
            console.log(`User ${u.email} already exists.`);
        }

        // Add some sample transactions for this user so the modules work visually
        const transactionCount = await prisma.transaction.count({ where: { userId: user.id } });
        if (transactionCount === 0) {
            console.log(`Adding sample transactions for ${u.email}...`);
            await prisma.transaction.createMany({
                data: [
                    { description: 'Monthly Salary', amount: 85000, type: 'income', legacyCategory: 'Salary', userId: user.id, date: new Date() },
                    { description: 'Apartment Rent', amount: 25000, type: 'expense', legacyCategory: 'Housing', userId: user.id, date: new Date() },
                    { description: 'Groceries Store', amount: 4500, type: 'expense', legacyCategory: 'Food', userId: user.id, date: new Date() },
                    { description: 'Freelance Project', amount: 12000, type: 'income', legacyCategory: 'Salary', userId: user.id, date: new Date() },
                    { description: 'Electric Bill', amount: 1800, type: 'expense', legacyCategory: 'Bills', userId: user.id, date: new Date() }
                ]
            });
        }
    }

    console.log('--- Seed Process Completed ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
