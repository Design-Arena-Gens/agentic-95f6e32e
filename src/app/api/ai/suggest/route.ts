import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ problemId: z.string().optional(), text: z.string().optional() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success || (!parsed.data.problemId && !parsed.data.text)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  let text = parsed.data.text ?? '';
  if (parsed.data.problemId) {
    const p = await prisma.problem.findUnique({ where: { id: parsed.data.problemId } });
    if (!p) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    text = `${p.title}\n\n${p.description}`;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a concise, empathetic problem-solving assistant. Provide actionable steps.' },
            { role: 'user', content: `Problem: ${text}\n\nGive a helpful, step-by-step solution.` },
          ],
          temperature: 0.4,
          max_tokens: 300,
        }),
      });
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || 'No suggestion available.';
      return NextResponse.json({ suggestion: content });
    } catch {
      // fallthrough to heuristic
    }
  }

  // Fallback heuristic suggestion
  const fallback = `Here is a practical plan you can try:\n\n1. Define the exact problem and desired outcome.\n2. Break it into 3-5 subproblems.\n3. Tackle the riskiest subproblem first.\n4. Ask a domain expert or use search to validate assumptions.\n5. Set a 48-hour checkpoint and adjust based on results.`;
  return NextResponse.json({ suggestion: fallback });
}
