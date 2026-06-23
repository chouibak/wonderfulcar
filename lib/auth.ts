import { cookies } from 'next/headers';

const COOKIE_NAME = 'wc_admin';

export function getSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN || '';
}

export async function isAdmin() {
  const token = getSessionToken();
  if (!token) return false;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === token;
}

export function verifyPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || '';
  return expected.length > 0 && password === expected;
}

export { COOKIE_NAME };
