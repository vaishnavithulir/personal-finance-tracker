import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const prismaClientOptions: any = {
  log: ['query'],
}

// Only use the LibSql adapter if we are using a LibSql/SQLite database
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
if (dbUrl.startsWith('file:') || dbUrl.startsWith('libsql:')) {
  const adapter = new PrismaLibSql({
    url: dbUrl,
  })
  prismaClientOptions.adapter = adapter
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
