/*
 * Proxy del formulario "Solicitar cotización" del detalle de cada servicio hacia la API central
 * (POST /public/cotizaciones). Mismo patrón que los demás proxies: el navegador no habla directo con la
 * API, el marcaId lo pone el servidor y la IP real del visitante viaja en x-forwarded-for.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ message: 'Cotizaciones no configuradas' }, { status: 503 });
  const body = await req.text();
  if (body.length > 10_000) return Response.json({ message: 'Solicitud demasiado grande' }, { status: 413 });
  try {
    const res = await fetch(`${API_URL}/public/cotizaciones?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body,
      cache: 'no-store',
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return Response.json({ message: 'No pudimos conectarnos. Intenta de nuevo.' }, { status: 502 });
  }
}
