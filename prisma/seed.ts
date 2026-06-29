import { PrismaClient } from '@prisma/client';
import { CARS_CATALOG } from '../lib/cars-catalog';
import { DEFAULT_SETTINGS } from '../lib/settings';

const prisma = new PrismaClient();

async function syncCars() {
  let added = 0;

  for (const car of CARS_CATALOG) {
    const existing = await prisma.car.findFirst({ where: { name: car.name } });
    if (existing) continue;

    await prisma.car.create({
      data: {
        ...car,
        active: car.active !== false,
      },
    });
    added += 1;
  }

  const total = await prisma.car.count();
  console.log(`Cars sync: ${added} added, ${total} total in database.`);
}

async function syncSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    await prisma.siteSettings.create({ data: { id: 1, ...DEFAULT_SETTINGS } });
    console.log('Seeded site settings.');
  } else {
    console.log('Site settings already exist — skipping settings seed.');
  }
}

async function main() {
  await syncCars();
  await syncSettings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
