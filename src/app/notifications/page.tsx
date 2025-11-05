/* eslint-disable @typescript-eslint/no-explicit-any */
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function NotificationsPage() {
  const user = await currentUser();
  let data: any[] = [];
  if (user) {
    data = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Notifications</h1>
      {!user && <div>Please login to view notifications.</div>}
      {user && data.length === 0 && <div>No notifications yet.</div>}
      {user && (
        <ul className="space-y-2">
          {data.map((n: any) => (
            <li key={n.id} className="bg-white border rounded p-3 text-sm">
              <div>{n.type} ? {new Date(n.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
