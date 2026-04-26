const prisma = require('./db');

async function check() {
    const user = await prisma.user.findUnique({
        where: { email: 'gayuyoga8754@gmail.com' }
    });
    if (user) {
        console.log('IDENTITY_FOUND');
        console.log(JSON.stringify({
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }, null, 2));
    } else {
        console.log('IDENTITY_NOT_FOUND');
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
