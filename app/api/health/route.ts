import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const hasUrl = Boolean(process.env.DATABASE_URL);
  const urlPreview = hasUrl
    ? process.env.DATABASE_URL!.replace(/:([^:@/]+)@/, ':***@').split('?')[0]
    : null;

  if (!hasUrl) {
    return NextResponse.json(
      {
        ok: false,
        database: 'missing',
        message: 'DATABASE_URL is not set in environment variables.',
        hint: 'On EasyPanel: open your App service → Environment → add DATABASE_URL.',
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const [cars, settings] = await Promise.all([
      prisma.car.count(),
      prisma.siteSettings.count(),
    ]);

    return NextResponse.json({
      ok: true,
      database: 'connected',
      url: urlPreview,
      tables: { cars, siteSettings: settings },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';

    return NextResponse.json(
      {
        ok: false,
        database: 'error',
        url: urlPreview,
        message,
        hints: [
          'Use the INTERNAL Postgres URL from EasyPanel (not localhost).',
          'Hostname must be the Postgres service name, e.g. PROJECTNAME_servicename.',
          'App and Postgres must be in the same EasyPanel project.',
          'After first deploy run: npx prisma db push && npm run db:seed',
          'Internal Docker URL usually uses ?sslmode=disable',
        ],
      },
      { status: 503 }
    );
  }
}
