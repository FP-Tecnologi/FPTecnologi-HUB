/*
 * Tickets de soporte -> API central (POST /public/tickets). El navegador no habla directo con la API:
 * el marcaId lo pone el servidor y la IP real del visitante viaja en x-forwarded-for.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ error: 'Tickets no configurados' }, { status: 503 });
  const body = await req.text();
  if (body.length > 20_000) return Response.json({ error: 'Solicitud demasiado grande' }, { status: 413 });
  try {
    const res = await fetch(`${API_URL}/public/tickets?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '' },
      body,
      cache: 'no-store',
    });
    const j = (await res.json().catch(() => null)) as { data?: { numero?: string | null }; message?: string | string[] } | null;
    if (!res.ok) {
      const msg = Array.isArray(j?.message) ? j.message.join(', ') : j?.message;
      return Response.json({ error: msg || 'No pudimos registrar tu ticket. Inténtalo de nuevo.' }, { status: res.status });
    }
    return Response.json({ success: true, numero: j?.data?.numero ?? null });
  } catch {
    return Response.json({ error: 'No pudimos conectarnos. Inténtalo de nuevo.' }, { status: 502 });
  }
}
