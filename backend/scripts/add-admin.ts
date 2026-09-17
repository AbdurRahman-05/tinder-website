import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addAdmin() {
  const hash = await bcrypt.hash('Admin@123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@prism.com' },
    update: {
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@prism.com',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('Successfully configured admin@prism.com with Admin@123456 as SUPER_ADMIN');
}

addAdmin().catch(console.error).finally(() => prisma.$disconnect());
