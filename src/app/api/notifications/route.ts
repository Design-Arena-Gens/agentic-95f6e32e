import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ notifications: [] });
  const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { ids } = await req.json();
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  await prisma.notification.updateMany({ where: { id: { in: ids }, userId: user.id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
