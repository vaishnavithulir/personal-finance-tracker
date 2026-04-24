const prisma = require('./db');
const bcrypt = require('bcryptjs');

async function main() {
    const email = 'yogasriatshayak@gmail.com';
    const password = 'admin123'; // Default for them to use
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'Admin',
            password: hashedPassword
        },
        create: {
            email,
            password: hashedPassword,
            fullName: 'Yogasri Atshaya',
            role: 'Admin'
        }
    });

    console.log(`Admin user ${email} is ready. [Password: ${password}]`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
