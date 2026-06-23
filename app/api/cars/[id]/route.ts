import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { parseCarBody, serializeCar } from '@/lib/cars';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const carId = parseInt(id, 10);
  if (!Number.isFinite(carId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const data = parseCarBody(await request.json());
  if (!data) {
    return NextResponse.json({ error: 'Invalid car data' }, { status: 400 });
  }

  try {
    const car = await prisma.car.update({ where: { id: carId }, data });
    return NextResponse.json(serializeCar(car));
  } catch {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const carId = parseInt(id, 10);
  if (!Number.isFinite(carId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await prisma.car.delete({ where: { id: carId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }
}
