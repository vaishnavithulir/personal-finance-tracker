const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function migrate() {
    const activePrisma = new PrismaClient(); // Default active DB
    
    const legacyUser = {
        fullName: "YOGASRI ATSHAYA ",
        email: "gayuyoga8754@gmail.com",
        role: "Admin", // Elevating to Admin for convenience
        bankName: "KVB Bank",
        accountNumber: "123456789012",
        ifscCode: "JFCN12345"
    };

    const password = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const user = await activePrisma.user.upsert({
            where: { email: legacyUser.email },
            update: {
                role: legacyUser.role,
                password: hashedPassword,
                bankName: legacyUser.bankName,
                accountNumber: legacyUser.accountNumber,
                ifscCode: legacyUser.ifscCode
            },
            create: {
                ...legacyUser,
                password: hashedPassword
            }
        });
        console.log('MIGRATION_SUCCESS');
        console.log(`Identity ${user.email} is now synchronized in the active vault.`);
        console.log(`Security Key set to: ${password}`);
    } catch (e) {
        console.error('MIGRATION_FAULT:', e.message);
    } finally {
        await activePrisma.$disconnect();
    }
}

migrate();
