import { cookies } from 'next/headers';
import { dict, type Lang } from './i18n';

export function getLang(): Lang {
  const c = cookies().get('lang')?.value;
  return (c === 'hi' ? 'hi' : 'en');
}

export function t(key: string) {
  const lang = getLang();
  return dict[lang][key] ?? key;
}
