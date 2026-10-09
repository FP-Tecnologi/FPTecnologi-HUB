import { cookies } from 'next/headers';
import { COOKIE_CUENTA } from '@/lib/cuenta';

/* PDF de una cotización ya enviada al cliente de la sesión; el token vive en una cookie httpOnly de esta web. */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get(COOKIE_CUENTA)?.value;
  if (!token || !MARCA_ID || !/^[0-9a-f-]{36}$/.test(id)) return new Response('No autorizado', { status: 401 });
  try {
    const res = await fetch(`${API_URL}/public/cuenta/cotizaciones/${id}/pdf?marcaId=${encodeURIComponent(MARCA_ID)}`, { headers: { 'x-cuenta-token': token }, cache: 'no-store' });
    if (!res.ok || !res.body) return new Response('No disponible', { status: res.status === 401 ? 401 : 404 });
    return new Response(res.body, { headers: { 'content-type': 'application/pdf', 'content-disposition': res.headers.get('content-disposition') ?? 'attachment; filename="cotizacion.pdf"', 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } });
  } catch {
    return new Response('No pudimos conectarnos', { status: 502 });
  }
}
