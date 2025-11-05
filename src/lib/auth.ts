import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const authSecret = (process.env.AUTH_SECRET || 'dev_secret_change_me').toString();
const encoder = new TextEncoder();

export type SessionPayload = { userId: string };

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encoder.encode(authSecret));

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  cookies().set('session', '', { httpOnly: true, maxAge: 0, path: '/' });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encoder.encode(authSecret));
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function currentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return user;
}
