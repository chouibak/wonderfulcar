import { PrismaClient } from '@prisma/client';
import { DEFAULT_SETTINGS } from '../lib/settings';

const prisma = new PrismaClient();

const SEED_CARS = [
  { name: 'Dacia Sandero', category: 'economique', price: 199, transmission: 'manuelle', seats: 5, fuel: 'Essence', bags: 2, image: '/assets/cars/dacia-sandero.jpg', badge: 'N°1 Maroc' },
  { name: 'Renault Clio V', category: 'economique', price: 210, transmission: 'manuelle', seats: 5, fuel: 'Essence', bags: 2, image: '/assets/cars/renault-clio-v.jpg', badge: 'Populaire' },
  { name: 'Dacia Logan', category: 'economique', price: 220, transmission: 'manuelle', seats: 5, fuel: 'Essence', bags: 3, image: '/assets/cars/dacia-logan.jpg', badge: 'Économique' },
  { name: 'Kia Picanto', category: 'economique', price: 190, transmission: 'manuelle', seats: 4, fuel: 'Essence', bags: 1, image: '/assets/cars/kia-picanto.jpg', badge: 'City' },
  { name: 'Hyundai i10', category: 'economique', price: 200, transmission: 'manuelle', seats: 4, fuel: 'Essence', bags: 1, image: '/assets/cars/hyundai-i10.jpg', badge: 'Économique' },
  { name: 'Peugeot 208', category: 'compacte', price: 280, transmission: 'manuelle', seats: 5, fuel: 'Essence', bags: 2, image: '/assets/cars/peugeot-208.jpg', badge: 'Compacte' },
  { name: 'Citroën C3', category: 'compacte', price: 260, transmission: 'manuelle', seats: 5, fuel: 'Essence', bags: 2, image: '/assets/cars/citroen-c3.jpg', badge: 'Compacte' },
  { name: 'Peugeot 301', category: 'compacte', price: 270, transmission: 'manuelle', seats: 5, fuel: 'Essence', bags: 3, image: '/assets/cars/peugeot-301.jpg', badge: 'Berline' },
  { name: 'Renault Symbol', category: 'compacte', price: 250, transmission: 'manuelle', seats: 5, fuel: 'Essence', bags: 3, image: '/assets/cars/renault-symbol.jpg', badge: 'Berline' },
  { name: 'Citroën C-Elysée', category: 'compacte', price: 290, transmission: 'manuelle', seats: 5, fuel: 'Diesel', bags: 3, image: '/assets/cars/citroen-c-elysee.jpg', badge: 'Berline' },
  { name: 'Renault Captur', category: 'suv', price: 420, transmission: 'automatique', seats: 5, fuel: 'Essence', bags: 4, image: '/assets/cars/renault-captur.jpg', badge: 'SUV' },
  { name: 'Dacia Duster', category: '4x4', price: 480, transmission: 'manuelle', seats: 5, fuel: 'Diesel', bags: 4, image: '/assets/cars/dacia-duster.jpg', badge: '4x4' },
  { name: 'Hyundai Tucson', category: 'suv', price: 500, transmission: 'automatique', seats: 5, fuel: 'Diesel', bags: 4, image: '/assets/cars/hyundai-tucson.jpg', badge: 'SUV' },
  { name: 'Dacia Lodgy', category: 'monospace', price: 450, transmission: 'manuelle', seats: 7, fuel: 'Diesel', bags: 4, image: '/assets/cars/dacia-lodgy.jpg', badge: '7 places' },
  { name: 'Dacia Jogger', category: 'monospace', price: 480, transmission: 'manuelle', seats: 7, fuel: 'Essence', bags: 4, image: '/assets/cars/dacia-jogger.jpg', badge: '7 places' },
  { name: 'Renault Kangoo', category: 'monospace', price: 400, transmission: 'manuelle', seats: 5, fuel: 'Diesel', bags: 5, image: '/assets/cars/renault-kangoo.jpg', badge: 'Familiale' },
];

async function main() {
  const count = await prisma.car.count();
  if (count === 0) {
    await prisma.car.createMany({ data: SEED_CARS });
    console.log(`Seeded ${SEED_CARS.length} cars.`);
  } else {
    console.log(`Database already has ${count} cars — skipping car seed.`);
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    await prisma.siteSettings.create({ data: { id: 1, ...DEFAULT_SETTINGS } });
    console.log('Seeded site settings.');
  } else {
    console.log('Site settings already exist — skipping settings seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
