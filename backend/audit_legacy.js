const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function checkLegacy() {
    // Force Prisma to look at the root dev.db
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: `file:${path.join(__dirname, '../dev.db')}`
            }
        }
    });

    try {
        const user = await prisma.user.findUnique({
            where: { email: 'gayuyoga8754@gmail.com' }
        });
        if (user) {
            console.log('LEGACY_IDENTITY_FOUND');
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log('LEGACY_IDENTITY_NOT_FOUND');
        }
    } catch (e) {
        console.error('LEGACY_AUDIT_FAULT:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkLegacy();
