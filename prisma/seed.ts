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

async function addAdmin() {
  await prisma.user.create({
    data: {
      id: 0,
      email: "admin@gmail.com",
      phone: "0769341231",
      firstName: "khanh",
      lastName:"nguyen",
      role: "ADMIN",
      password: "$argon2id$v=19$m=65536,t=3,p=4$K+2KSAIj2ZtOW2hVOslJIQ$tJPlcLsfqLLW3p/K7OxH5nwUdUG2A+h4GmLI8WTF3SA"
    }
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

addAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
