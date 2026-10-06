/* Registro de socios -> API central (POST /public/socios/registro). La solicitud queda PENDIENTE hasta que el equipo la aprueba. */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ error: 'Registro no configurado' }, { status: 503 });
  const body = await req.text();
  if (body.length > 10_000) return Response.json({ error: 'Solicitud demasiado grande' }, { status: 413 });
  try {
    const res = await fetch(`${API_URL}/public/socios/registro?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '' },
      body,
      cache: 'no-store',
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
      const msg = Array.isArray(j?.message) ? j.message.join(', ') : j?.message;
      return Response.json({ error: msg || 'No pudimos registrar tu solicitud. Inténtalo de nuevo.' }, { status: res.status });
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'No pudimos conectarnos. Inténtalo de nuevo.' }, { status: 502 });
  }
}
