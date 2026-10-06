import { cookies } from 'next/headers';
import { COOKIE_CUENTA } from '@/lib/cuenta';

/*
 * Descarga/vista previa de un recurso de socios. Los archivos son privados: la API solo los entrega con el token de
 * sesión, que vive en una cookie httpOnly de esta web. Aquí se lee la cookie y se reenvía el archivo en streaming
 * (con Range, para que los videos se puedan adelantar). Sin sesión de socio activo no sale nada.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = (await cookies()).get(COOKIE_CUENTA)?.value;
  if (!token || !MARCA_ID || !/^[0-9a-f-]{36}$/.test(id)) return new Response('No autorizado', { status: 401 });
  const inline = new URL(req.url).searchParams.get('inline') === '1' ? '&inline=1' : '';
  const headers: Record<string, string> = { 'x-cuenta-token': token };
  const range = req.headers.get('range');
  if (range) headers.range = range;
  try {
    const res = await fetch(`${API_URL}/public/socios/recursos/${id}/archivo?marcaId=${encodeURIComponent(MARCA_ID)}${inline}`, { headers, cache: 'no-store' });
    if (!res.ok && res.status !== 206) return new Response('No disponible', { status: res.status === 403 || res.status === 401 ? res.status : 404 });
    const salida = new Headers();
    for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'content-disposition', 'etag', 'last-modified']) {
      const v = res.headers.get(h);
      if (v) salida.set(h, v);
    }
    salida.set('cache-control', 'private, no-store');
    salida.set('x-content-type-options', 'nosniff');
    salida.set('content-security-policy', "default-src 'none'; sandbox");
    return new Response(res.body, { status: res.status, headers: salida });
  } catch {
    return new Response('No pudimos conectarnos', { status: 502 });
  }
}
