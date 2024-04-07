import { PrismaClient } from '@prisma/client';
import { categories } from './data/categories';
import { sizes } from './data/sizes';
import { shops } from './data/shops';
import { materials } from './data/material';
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

async function addShops() {
  await prisma.shop.createMany({
    data: shops,
  });
}

async function addMaterials() {
  await prisma.material.createMany({
    data: materials,
  });
}

addSizes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

addMaterials()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

addShops()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

addCategories()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
