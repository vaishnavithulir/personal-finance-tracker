const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const adapter = new PrismaLibSql({ url: 'file:../dev.db' });
const prisma = new PrismaClient({ adapter });

async function run() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    await prisma.user.update({
        where: { email: 'mohan@gmail.com' },
        data: { password: hashedPassword }
    });
    console.log('Password updated for mohan@gmail.com to password123');
}
run();
