import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'finances_session';
const ONE_DAY_SECONDS = 24 * 60 * 60;

function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  if (!body?.token) {
    return NextResponse.json({ message: 'Token ausente' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, body.token, {
    ...getSessionCookieOptions(),
    maxAge: ONE_DAY_SECONDS,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
