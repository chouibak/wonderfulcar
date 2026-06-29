import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import {
  DEFAULT_SETTINGS,
  parseSettingsBody,
  serializeSettings,
} from '@/lib/settings';

export async function GET() {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (row) {
      return NextResponse.json(serializeSettings(row));
    }
  } catch {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  return NextResponse.json(DEFAULT_SETTINGS);
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = parseSettingsBody(await request.json());
  if (!data) {
    return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
  }

  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });
    return NextResponse.json(serializeSettings(settings));
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
