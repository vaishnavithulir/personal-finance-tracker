import { PrismaClient } from '@prisma/client'

const prismaClientOptions: any = {
  log: ['query', 'error', 'warn'],
}

// Standard Prisma 7 Client initialization
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
