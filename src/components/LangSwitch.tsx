"use client";
import { useEffect, useState } from 'react';

export default function LangSwitch() {
  const [lang, setLang] = useState<'en'|'hi'>('en');
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )lang=(hi|en)/);
    if (m) setLang((m[1] as 'en'|'hi'));
  }, []);
  function set(l: 'en'|'hi') {
    document.cookie = `lang=${l}; path=/; max-age=${60*60*24*365}`;
    setLang(l);
    window.location.reload();
  }
  return (
    <div className="flex items-center gap-1 text-xs">
      <button onClick={() => set('en')} className={`px-2 py-1 rounded border ${lang==='en'?'bg-black text-white':'bg-white'}`}>EN</button>
      <button onClick={() => set('hi')} className={`px-2 py-1 rounded border ${lang==='hi'?'bg-black text-white':'bg-white'}`}>HI</button>
    </div>
  );
}
