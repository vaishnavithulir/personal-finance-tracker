const prisma = require('./db');

async function listUsers() {
    const users = await prisma.user.findMany({
        select: { id: true, fullName: true, email: true, role: true }
    });
    console.log('--- SYSTEM_IDENTITY_LIST ---');
    console.log(JSON.stringify(users, null, 2));
    console.log('--- END_LIST ---');
}

listUsers().catch(console.error).finally(() => prisma.$disconnect());
