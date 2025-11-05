/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { useLang } from "@/lib/useLang";

type Problem = {
  id: string;
  title: string;
  description: string;
  category: string;
  score: number;
  createdAt: string;
  author: { id: string; name: string | null };
  _count: { solutions: number };
};

export default function Home() {
  const t = useLang();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest'|'trending'>('latest');
  const [category, setCategory] = useState<string>('');
  const [q, setQ] = useState('');

  const qs = useMemo(() => {
    const u = new URLSearchParams();
    u.set('sort', sort);
    if (category) u.set('category', category);
    if (q) u.set('q', q);
    return u.toString();
  }, [sort, category, q]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/problems?${qs}`).then(r => r.json()).then(d => setProblems(d.problems)).finally(() => setLoading(false));
  }, [qs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="text-2xl font-semibold">{t.latestTrending}</div>
        <div className="ml-auto flex gap-2">
          <select className="border rounded px-2 py-1" value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="latest">Latest</option>
            <option value="trending">Trending</option>
          </select>
          <select className="border rounded px-2 py-1" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">{t.allCategories}</option>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <input placeholder={t.search} className="border rounded px-2 py-1" value={q} onChange={e => setQ(e.target.value)} />
          <Link className="bg-black text-white px-3 py-1 rounded" href="/post">{t.post}</Link>
        </div>
      </div>
      {loading && <div>Loading…</div>}
      {!loading && problems.length === 0 && <div>No problems yet.</div>}
      <ul className="space-y-3">
        {problems.map(p => (
          <li key={p.id} className="bg-white rounded border p-4">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{p.category}</span>
              <span>•</span>
              <span>by <Link className="underline" href={`/profile/${p.author.id}`}>{p.author.name ?? 'User'}</Link></span>
              <span>•</span>
              <span>{new Date(p.createdAt).toLocaleString()}</span>
            </div>
            <Link href={`/problem/${p.id}`} className="block mt-1 font-medium text-lg hover:underline">{p.title}</Link>
            <div className="text-sm text-gray-700 line-clamp-2">{p.description}</div>
            <div className="mt-2 text-sm text-gray-700">Score: {p.score} · Solutions: {p._count.solutions}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
