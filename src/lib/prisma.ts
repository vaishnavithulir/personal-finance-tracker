import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientOptions: any = {
  log: ['query'],
}

// Support both local SQLite and Cloud PostgreSQL (Prisma 7 pattern)
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'

if (dbUrl.startsWith('file:') || dbUrl.startsWith('libsql:')) {
  const adapter = new PrismaLibSql({
    url: dbUrl,
  })
  prismaClientOptions.adapter = adapter
} else {
  const pool = new Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  prismaClientOptions.adapter = adapter
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
