import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function Profile({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return notFound();
  const solutions = await prisma.solution.findMany({ where: { authorId: user.id }, select: { id: true } });
  const votes = await prisma.vote.findMany({ where: { solutionId: { in: solutions.map(s => s.id) } } });
  const reputation = votes.reduce((s, v) => s + v.value, 0);
  const badge = reputation >= 200 ? 'Genius' : reputation >= 80 ? 'Expert' : reputation >= 20 ? 'Helper' : 'Newbie';

  const problems = await prisma.problem.findMany({ where: { authorId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 });

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded p-4">
        <h1 className="text-xl font-semibold">{user.name ?? 'User'}</h1>
        <div className="text-sm text-gray-700">Badge: {badge} ? Reputation: {reputation}</div>
      </div>
      <div className="space-y-2">
        <h2 className="font-medium">Recent problems</h2>
        {problems.length === 0 && <div className="text-sm text-gray-600">No problems yet.</div>}
        <ul className="space-y-2">
          {problems.map(p => (
            <li key={p.id} className="bg-white border rounded p-3">
              <div className="text-xs text-gray-600">{p.category} ? {new Date(p.createdAt).toLocaleString()}</div>
              <a href={`/problem/${p.id}`} className="font-medium hover:underline">{p.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
