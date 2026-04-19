import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db',
  })
  
  const prisma = new PrismaClient({
    adapter,
    log: ['query'],
  })

  const bcrypt = require('bcryptjs')
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('password123', salt)

  // Create/Upsert Demo User
  const user = await prisma.user.upsert({
    where: { email: 'demo@dumbo.com' },
    update: {},
    create: {
      email: 'demo@dumbo.com',
      fullName: 'Demo User',
      password: hashedPassword,
    },
  })

  // Create some professional categories
  const catSalary = await prisma.category.create({
    data: { name: 'Salary', icon: 'money-bill-wave', color: '#10b981', userId: user.id }
  })
  const catHousing = await prisma.category.create({
    data: { name: 'Housing', icon: 'home', color: '#3b82f6', userId: user.id }
  })
  const catFood = await prisma.category.create({
    data: { name: 'Food & Dining', icon: 'utensils', color: '#f59e0b', userId: user.id }
  })
  const catEntertainment = await prisma.category.create({
    data: { name: 'Entertainment', icon: 'film', color: '#8b5cf6', userId: user.id }
  })

  // Add sample transactions linked to categories
  await prisma.transaction.createMany({
    data: [
      { amount: 50000, description: 'Monthly Salary', type: 'income', categoryId: catSalary.id, userId: user.id },
      { amount: 12000, description: 'Rent Payment', type: 'expense', categoryId: catHousing.id, userId: user.id },
      { amount: 2500, description: 'Weekend Groceries', type: 'expense', categoryId: catFood.id, userId: user.id },
      { amount: 1500, description: 'Netflix Subscription', type: 'expense', categoryId: catEntertainment.id, userId: user.id },
      { amount: 10000, description: 'Freelance Design Project', type: 'income', categoryId: catSalary.id, userId: user.id },
    ]
  })

  // Set a budget
  await prisma.budget.create({
    data: {
      limit: 5000,
      period: 'monthly',
      categoryId: catFood.id,
      userId: user.id
    }
  })

  // Set a financial goal
  await prisma.financialGoal.create({
    data: {
      title: 'New MacBook Pro',
      targetAmount: 200000,
      currentAmount: 15000,
      userId: user.id
    }
  })

  console.log('✅ Database developed and seeded with Premium features!');
  await prisma.$disconnect()
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
