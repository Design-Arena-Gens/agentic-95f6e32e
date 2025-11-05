import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const problem = await prisma.problem.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      solutions: { include: { author: true }, orderBy: [{ score: 'desc' }, { createdAt: 'asc' }] },
    },
  });
  if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ problem });
}
