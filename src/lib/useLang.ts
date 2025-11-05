"use client";
import { useEffect, useState } from 'react';
import { dict, type Lang } from './i18n';

export function useLang() {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )lang=(hi|en)/);
    if (m) setLang((m[1] as 'en'|'hi'));
  }, []);
  return dict[lang];
}
