import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const solutions = await prisma.solution.findMany({ where: { authorId: user.id }, select: { id: true } });
  const votes = await prisma.vote.findMany({ where: { solutionId: { in: solutions.map(s => s.id) } } });
  const reputation = votes.reduce((s, v) => s + v.value, 0);

  const badge = reputation >= 200 ? 'Genius' : reputation >= 80 ? 'Expert' : reputation >= 20 ? 'Helper' : 'Newbie';

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      reputation,
      badge,
    },
  });
}
