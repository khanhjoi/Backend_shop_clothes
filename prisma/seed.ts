import { PrismaClient } from '@prisma/client';
import { categories } from './data/categories';
import { sizes } from './data/sizes';

const prisma = new PrismaClient();

async function addCategories() {
  await prisma.category.createMany({
    data: categories,
  });
}

async function addSizes() {
  await prisma.size.createMany({
    data: sizes,
  });
}

addSizes().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async() => {
  await prisma.$disconnect();
})

addCategories().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async() => {
  await prisma.$disconnect();
})