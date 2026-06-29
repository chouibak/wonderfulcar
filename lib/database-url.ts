/**
 * Normalize DATABASE_URL for Prisma + Postgres on VPS/EasyPanel.
 */
export function normalizeDatabaseUrl(raw?: string | null): string | null {
  if (!raw?.trim()) return null;

  let url = raw.trim();

  // Prisma accepts both, but postgresql:// is the canonical form.
  if (url.startsWith('postgres://')) {
    url = `postgresql://${url.slice('postgres://'.length)}`;
  }

  return url;
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
