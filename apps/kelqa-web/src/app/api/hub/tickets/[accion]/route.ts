/*
 * Seguimiento de tickets -> API central (POST /public/tickets/seguimiento | responder). Mismo esquema que /api/tickets:
 * el marcaId lo pone el servidor y la IP real del visitante viaja en x-forwarded-for (la API limita los intentos
 * porque número + correo hacen de contraseña).
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';
const ACCIONES = new Set(['seguimiento', 'responder']);

export async function POST(req: Request, ctx: { params: Promise<{ accion: string }> }) {
  const { accion } = await ctx.params;
  if (!ACCIONES.has(accion)) return Response.json({ error: 'No encontrado' }, { status: 404 });
  if (!MARCA_ID) return Response.json({ error: 'Tickets no configurados' }, { status: 503 });
  const body = await req.text();
  if (body.length > 20_000) return Response.json({ error: 'Solicitud demasiado grande' }, { status: 413 });
  try {
    const res = await fetch(`${API_URL}/public/tickets/${accion}?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '' },
      body,
      cache: 'no-store',
    });
    const j = (await res.json().catch(() => null)) as { data?: unknown; message?: string | string[] } | null;
    if (!res.ok) {
      const msg = Array.isArray(j?.message) ? j.message.join(', ') : j?.message;
      return Response.json({ error: msg || 'No pudimos completar la solicitud.' }, { status: res.status });
    }
    return Response.json({ success: true, data: j?.data ?? null });
  } catch {
    return Response.json({ error: 'No pudimos conectarnos. Inténtalo de nuevo.' }, { status: 502 });
  }
}
