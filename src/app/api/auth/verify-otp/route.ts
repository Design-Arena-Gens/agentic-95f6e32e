import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

const schema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success || (!parsed.data.email && !parsed.data.phone)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { email, phone, code } = parsed.data;

  const otp = await prisma.otpCode.findFirst({
    where: { email: email ?? undefined, phone: phone ?? undefined, code, consumed: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp || otp.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  // Mark consumed
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });

  // Find or create user
  let user = await prisma.user.findFirst({ where: { OR: [{ email: email ?? undefined }, { phone: phone ?? undefined }] } });
  if (!user) {
    user = await prisma.user.create({ data: { email: email ?? null, phone: phone ?? null, name: email ?? phone ?? 'User' } });
  }

  await createSession(user.id);

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, phone: user.phone, name: user.name } });
}
