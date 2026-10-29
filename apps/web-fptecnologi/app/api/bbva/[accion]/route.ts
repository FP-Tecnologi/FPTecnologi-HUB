/*
 * Tarjetas BBVA -> API central (POST /public/bbva/ofertas | /public/bbva/solicitar).
 * El navegador no habla directo con la API: el marcaId lo pone el servidor y la
 * IP real del visitante viaja en x-forwarded-for para el tope anti-abuso.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';
const ACCIONES = new Set(['ofertas', 'solicitar']);

export async function POST(req: Request, { params }: { params: Promise<{ accion: string }> }) {
  const { accion } = await params;
  if (!ACCIONES.has(accion)) return Response.json({ error: 'No encontrado' }, { status: 404 });
  if (!MARCA_ID) return Response.json({ error: 'Servicio no configurado' }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400 });
  }
  if (accion === 'ofertas' && !body.origen) {
    try {
      body.origen = new URL(req.headers.get('referer') ?? '').pathname;
    } catch {
      /* sin referer */
    }
  }

  try {
    const res = await fetch(`${API_URL}/public/bbva/${accion}?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const j = (await res.json().catch(() => null)) as { data?: unknown; message?: string | string[] } | null;
    if (!res.ok) {
      const msg = Array.isArray(j?.message) ? j.message[0] : j?.message;
      return Response.json({ error: msg || 'No pudimos hacer la consulta. Inténtalo de nuevo.' }, { status: res.status });
    }
    return Response.json(j?.data ?? j);
  } catch {
    return Response.json({ error: 'No pudimos conectarnos. Inténtalo de nuevo.' }, { status: 502 });
  }
}
