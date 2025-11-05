import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';

export default async function MyProfile() {
  const user = await currentUser();
  if (!user) redirect('/login');
  redirect(`/profile/${user.id}`);
}
