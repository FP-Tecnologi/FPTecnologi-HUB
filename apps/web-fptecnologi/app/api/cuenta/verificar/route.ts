import { cookies } from 'next/headers';
import { apiCuenta, COOKIE_CUENTA, marcaConfigurada } from '@/lib/cuenta';

/* Proxy: verifica el código y guarda la sesión en una cookie httpOnly (30 días). El token no vuelve al navegador. */
export async function POST(req: Request) {
  if (!marcaConfigurada()) return Response.json({ message: 'Mi cuenta no está configurada todavía.' }, { status: 503 });
  const body = await req.text();
  if (body.length > 2_000) return Response.json({ message: 'Solicitud demasiado grande.' }, { status: 413 });
  try {
    const res = await fetch(apiCuenta('verificar'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, cache: 'no-store' });
    const json = (await res.json().catch(() => ({}))) as { data?: { token?: string; expiresAt?: string }; message?: string | string[] };
    if (!res.ok || !json.data?.token) {
      const msg = Array.isArray(json.message) ? json.message[0] : json.message;
      return Response.json({ message: msg || 'Código inválido o vencido' }, { status: res.status || 401 });
    }
    (await cookies()).set(COOKIE_CUENTA, json.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: json.data.expiresAt ? new Date(json.data.expiresAt) : undefined,
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ message: 'No pudimos conectarnos. Intenta de nuevo.' }, { status: 502 });
  }
}
