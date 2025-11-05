/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { currentUser } from '@/lib/auth';

const schema = z.object({
  targetType: z.enum(['PROBLEM','SOLUTION']),
  targetId: z.string(),
  value: z.number().int().refine(v => v === 1 || v === -1),
});

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const { targetType, targetId, value } = parsed.data;

  // Upsert vote
  const existing = await prisma.vote.findFirst({
    where: {
      userId: user.id,
      targetType: targetType as any,
      ...(targetType === 'PROBLEM' ? { problemId: targetId } : { solutionId: targetId }),
    },
  });

  if (!existing) {
    await prisma.vote.create({
      data: {
        userId: user.id,
        targetType: targetType as any,
        problemId: targetType === 'PROBLEM' ? targetId : null,
        solutionId: targetType === 'SOLUTION' ? targetId : null,
        value,
      },
    });
  } else if (existing.value === value) {
    await prisma.vote.delete({ where: { id: existing.id } });
  } else {
    await prisma.vote.update({ where: { id: existing.id }, data: { value } });
  }

  // Recompute score and notify
  if (targetType === 'PROBLEM') {
    const votes = await prisma.vote.findMany({ where: { problemId: targetId } });
    const score = votes.reduce((s, v) => s + v.value, 0);
    const updated = await prisma.problem.update({ where: { id: targetId }, data: { score } });
    if (updated.authorId !== user.id && value === 1) {
      await prisma.notification.create({ data: { userId: updated.authorId, type: 'upvote', refType: 'PROBLEM', problemId: updated.id } });
    }
  } else {
    const votes = await prisma.vote.findMany({ where: { solutionId: targetId } });
    const score = votes.reduce((s, v) => s + v.value, 0);
    const updated = await prisma.solution.update({ where: { id: targetId }, data: { score } });
    if (updated.authorId !== user.id && value === 1) {
      await prisma.notification.create({ data: { userId: updated.authorId, type: 'upvote', refType: 'SOLUTION', solutionId: updated.id } });
    }
    // Update reputation of solution author
    const authorVotes = await prisma.solution.findMany({ where: { authorId: updated.authorId }, select: { id: true } });
    const solutionIds = authorVotes.map(s => s.id);
    const repVotes = await prisma.vote.findMany({ where: { solutionId: { in: solutionIds } } });
    const reputation = repVotes.reduce((s, v) => s + v.value, 0);
    await prisma.user.update({ where: { id: updated.authorId }, data: { reputation, badge: calcBadge(reputation) as any } });
  }

  return NextResponse.json({ ok: true });
}

function calcBadge(rep: number): 'NONE'|'HELPER'|'EXPERT'|'GENIUS' {
  if (rep >= 200) return 'GENIUS';
  if (rep >= 80) return 'EXPERT';
  if (rep >= 20) return 'HELPER';
  return 'NONE';
}
