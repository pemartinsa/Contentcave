import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash('admin123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'admin@contentcave.com' },
    update: { password: hash, coins: 1000, name: 'Admin' },
    create: {
      email: 'admin@contentcave.com',
      name: 'Admin',
      password: hash,
      coins: 1000,
      subscription: {
        create: { plan: 'pro', status: 'active' },
      },
    },
  })

  console.log('✅ Usuario admin criado com sucesso!')
  console.log(`   Email: ${user.email}`)
  console.log(`   Senha: admin123`)
  console.log(`   Coins: ${user.coins}`)
  console.log(`   Plano: Pro`)
}

main()
  .catch((e) => {
    console.error('Erro:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
