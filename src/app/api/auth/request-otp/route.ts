import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success || (!parsed.data.email && !parsed.data.phone)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { email, phone } = parsed.data;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpCode.create({
    data: { email: email ?? null, phone: phone ?? null, code, purpose: 'login', expiresAt },
  });

  // Demo mode: return the OTP in response. In production, send via Email/SMS.
  return NextResponse.json({ ok: true, code });
}
