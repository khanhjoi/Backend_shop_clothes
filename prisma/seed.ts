import { PrismaClient } from '@prisma/client';
import { categories } from './data/categories';

const prisma = new PrismaClient();

async function addCategories() {
  await prisma.category.createMany({
    data: categories,
  });
}


addCategories().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async() => {
  await prisma.$disconnect();
})