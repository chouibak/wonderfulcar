export type CarInput = {
  name: string;
  category: string;
  price: number;
  transmission: string;
  seats: number;
  fuel: string;
  bags: number;
  image: string;
  badge: string;
  active?: boolean;
};

export function serializeCar(car: {
  id: number;
  name: string;
  category: string;
  price: number;
  transmission: string;
  seats: number;
  fuel: string;
  bags: number;
  image: string;
  badge: string;
  active: boolean;
}) {
  return {
    id: car.id,
    name: car.name,
    category: car.category,
    price: car.price,
    transmission: car.transmission,
    seats: car.seats,
    fuel: car.fuel,
    bags: car.bags,
    image: car.image,
    badge: car.badge,
    active: car.active,
  };
}

export function parseCarBody(body: unknown): CarInput | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const name = String(b.name || '').trim();
  const category = String(b.category || '').trim();
  const price = Number(b.price);
  const transmission = String(b.transmission || '').trim();
  const seats = Number(b.seats);
  const fuel = String(b.fuel || '').trim();
  const bags = Number(b.bags);
  const image = String(b.image || '').trim();
  const badge = String(b.badge || '').trim();

  if (!name || !category || !transmission || !fuel || !image) return null;
  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(seats) || seats < 1) return null;
  if (!Number.isFinite(bags) || bags < 0) return null;

  return {
    name,
    category,
    price: Math.round(price),
    transmission,
    seats: Math.round(seats),
    fuel,
    bags: Math.round(bags),
    image,
    badge: badge || 'Disponible',
    active: b.active !== false,
  };
}
