import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import LangSwitch from '@/components/LangSwitch';
import { dict } from '@/lib/i18n';
import { getLang } from '@/lib/i18nServer';

export default async function Nav() {
  const user = await currentUser();
  const lang = getLang();
  const t = dict[lang];
  return (
    <header className="border-b bg-white/50 backdrop-blur sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">{t.appName}</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="hover:underline">{t.home}</Link>
          <Link href="/post" className="hover:underline">{t.post}</Link>
          <Link href="/notifications" className="hover:underline">{t.notifications}</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href={`/profile/${user.id}`} className="hover:underline">{user.name ?? 'Profile'}</Link>
              <form action="/api/auth/logout" method="post">
                <button className="text-gray-600 hover:underline" type="submit">{t.logout}</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:underline">{t.login}</Link>
          )}
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
