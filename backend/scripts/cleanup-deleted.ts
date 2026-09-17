import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.profile.deleteMany({
    where: { status: 'DELETED' },
  });
  console.log(`Successfully purged ${result.count} soft-deleted profile(s) from the database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
