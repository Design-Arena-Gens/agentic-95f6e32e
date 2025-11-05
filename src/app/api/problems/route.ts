/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(['TECH','LIFE','CAREER','RELATIONSHIP','STUDY','BUSINESS','EMOTIONAL','OTHER']),
  media: z.any().optional(),
});

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const data = parsed.data;
  const problem = await prisma.problem.create({
    data: {
      authorId: user.id,
      title: data.title,
      description: data.description,
      category: data.category as any,
      media: data.media ?? null,
    },
  });
  return NextResponse.json({ problem });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get('sort') || 'latest';
  const category = searchParams.get('category') || undefined;
  const q = searchParams.get('q') || undefined;

  const where: any = {};
  if (category) where.category = category as any;
  if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];

  const orderBy = sort === 'trending' ? [{ score: 'desc' as const }, { createdAt: 'desc' as const }] : [{ createdAt: 'desc' as const }];

  const problems = await prisma.problem.findMany({
    where,
    orderBy,
    include: { author: true, _count: { select: { solutions: true } } },
    take: 50,
  });

  return NextResponse.json({ problems });
}
