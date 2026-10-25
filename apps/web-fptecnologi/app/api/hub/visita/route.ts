/*
 * Página vista → API del HUB (POST /public/visitas). El marcaId lo pone este servidor (HUB_MARCA_ID); viajan la IP real
 * (x-forwarded-for, solo para el visitante anónimo del día y el tope anti-abuso) y el navegador (user-agent).
 * Siempre responde 204: el contador nunca debe afectar a la web.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request) {
  const vacio = new Response(null, { status: 204 });
  if (!MARCA_ID) return vacio;
  try {
    const body = await req.text();
    if (body.length > 3_000) return vacio;
    const { ruta, referrer, utm } = JSON.parse(body) as { ruta?: unknown; referrer?: unknown; utm?: unknown };
    if (typeof ruta !== 'string') return vacio;
    const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined);
    await fetch(`${API_URL}/public/visitas?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-agent': req.headers.get('user-agent') ?? '',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body: JSON.stringify({ ruta: ruta.slice(0, 500), referrer: texto(referrer, 1000), utm: texto(utm, 100), host: req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '' }),
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
  } catch { /* sin contar: no pasa nada */ }
  return vacio;
}
