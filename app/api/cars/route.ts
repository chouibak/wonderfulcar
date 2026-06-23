import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { parseCarBody, serializeCar } from '@/lib/cars';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const adminView = searchParams.get('admin') === '1';
  const isAdminUser = await isAdmin();

  try {
    const cars = await prisma.car.findMany({
      where: adminView && isAdminUser ? undefined : { active: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(cars.map(serializeCar));
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = parseCarBody(await request.json());
  if (!data) {
    return NextResponse.json({ error: 'Invalid car data' }, { status: 400 });
  }

  try {
    const car = await prisma.car.create({ data });
    return NextResponse.json(serializeCar(car), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create car' }, { status: 500 });
  }
}
