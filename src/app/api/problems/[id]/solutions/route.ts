import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';

const schema = z.object({ content: z.string().min(2) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const problem = await prisma.problem.findUnique({ where: { id: params.id } });
  if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });

  const solution = await prisma.solution.create({
    data: {
      problemId: params.id,
      authorId: user.id,
      content: parsed.data.content,
    },
  });

  if (problem.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: problem.authorId,
        type: 'new_solution',
        refType: 'PROBLEM',
        problemId: problem.id,
        solutionId: solution.id,
      },
    });
  }

  return NextResponse.json({ solution });
}
