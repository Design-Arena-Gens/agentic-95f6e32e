"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';

export default function PostPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TECH');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/problems', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, category }) });
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else if (res.status === 401) {
      router.push('/login');
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl mx-auto bg-white border rounded p-4 space-y-3">
      <h1 className="text-lg font-semibold">Post a Problem</h1>
      <input className="w-full border rounded px-2 py-1" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="w-full border rounded px-2 py-1 h-40" placeholder="Describe your problem..." value={description} onChange={e => setDescription(e.target.value)} />
      <select className="w-full border rounded px-2 py-1" value={category} onChange={e => setCategory(e.target.value)}>
        {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
      </select>
      <button className="w-full bg-black text-white rounded py-2" type="submit">Submit</button>
    </form>
  );
}
