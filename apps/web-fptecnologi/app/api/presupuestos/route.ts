/*
 * Presupuesto mayorista -> API central (POST /public/presupuestos). El navegador
 * no habla directo con la API: el marcaId lo pone el servidor y la IP real del
 * visitante viaja en x-forwarded-for para el tope anti-spam de la API.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ error: 'Presupuestos no configurados' }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/public/presupuestos?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const j = (await res.json().catch(() => null)) as { data?: { id?: string | null; numero?: string | null }; message?: string | string[] } | null;
    if (!res.ok) {
      const msg = Array.isArray(j?.message) ? j.message.join(', ') : j?.message;
      return Response.json({ error: msg || 'No pudimos registrar tu presupuesto. Inténtalo de nuevo.' }, { status: res.status });
    }
    return Response.json({ success: true, id: j?.data?.id ?? null, numero: j?.data?.numero ?? null });
  } catch {
    return Response.json({ error: 'No pudimos conectarnos. Inténtalo de nuevo.' }, { status: 502 });
  }
}
