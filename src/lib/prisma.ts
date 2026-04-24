import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const prismaClientOptions: any = {
  log: ['query', 'error', 'warn'],
}

// Check if we are using SQLite or LibSQL
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'

if (dbUrl.startsWith('file:') || dbUrl.startsWith('libsql:')) {
  const adapter = new PrismaLibSql({
    url: dbUrl,
  })
  prismaClientOptions.adapter = adapter
}
// For PostgreSQL (starts with postgres:// or postgresql://), 
// Prisma 7 handles it natively without an adapter on standard servers like Render.

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
