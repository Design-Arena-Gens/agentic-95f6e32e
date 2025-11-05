/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ProblemDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [solution, setSolution] = useState('');
  const [ai, setAi] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/problems/${id}`).then(r => r.json()).then(d => setData(d.problem)).finally(() => setLoading(false));
  }, [id]);

  async function vote(targetType: 'PROBLEM'|'SOLUTION', targetId: string, value: 1|-1) {
    const res = await fetch('/api/votes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetType, targetId, value }) });
    if (res.status === 401) return alert('Please login');
    // refresh
    const d = await fetch(`/api/problems/${id}`).then(r => r.json());
    setData(d.problem);
  }

  async function addSolution() {
    const res = await fetch(`/api/problems/${id}/solutions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: solution }) });
    if (!res.ok) {
      if (res.status === 401) alert('Please login');
      return;
    }
    const d = await fetch(`/api/problems/${id}`).then(r => r.json());
    setData(d.problem); setSolution('');
  }

  async function suggest() {
    setAi('Loading?');
    const res = await fetch('/api/ai/suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problemId: id }) });
    const j = await res.json();
    setAi(j.suggestion);
  }

  if (loading) return <div>Loading?</div>;
  if (!data) return <div>Not found</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded p-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>{data.category}</span>
          <span>?</span>
          <span>by {data.author?.name ?? 'User'}</span>
        </div>
        <h1 className="text-xl font-semibold mt-1">{data.title}</h1>
        <p className="mt-2 whitespace-pre-wrap">{data.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <button className="px-2 py-1 border rounded" onClick={() => vote('PROBLEM', data.id, 1)}>?</button>
          <button className="px-2 py-1 border rounded" onClick={() => vote('PROBLEM', data.id, -1)}>?</button>
          <span className="text-sm text-gray-700">Score: {data.score}</span>
          <button className="ml-auto px-3 py-1 rounded bg-black text-white" onClick={suggest}>AI Suggest</button>
        </div>
        {ai && (
          <div className="mt-3 p-3 bg-gray-50 border rounded whitespace-pre-wrap text-sm">{ai}</div>
        )}
      </div>

      <div className="bg-white border rounded p-4 space-y-3">
        <h2 className="font-medium">Add a solution</h2>
        <textarea className="w-full border rounded px-2 py-1 h-32" value={solution} onChange={e => setSolution(e.target.value)} />
        <button className="px-3 py-1 rounded bg-black text-white" onClick={addSolution}>Submit</button>
      </div>

      <div className="space-y-3">
        {data.solutions?.map((s: any) => (
          <div key={s.id} className="bg-white border rounded p-4">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>by {s.author?.name ?? 'User'}</span>
              <span>?</span>
              <span>{new Date(s.createdAt).toLocaleString()}</span>
            </div>
            <div className="mt-1 whitespace-pre-wrap text-sm">{s.content}</div>
            <div className="mt-2 flex items-center gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => vote('SOLUTION', s.id, 1)}>?</button>
              <button className="px-2 py-1 border rounded" onClick={() => vote('SOLUTION', s.id, -1)}>?</button>
              <span className="text-sm text-gray-700">Score: {s.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
