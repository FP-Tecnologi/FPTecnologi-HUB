/*
 * Proxy del formulario de una landing hacia la API central (POST /public/landings/:slug/registro).
 * Igual que los demás proxies: el marcaId lo pone el servidor y la IP real del visitante viaja en
 * x-forwarded-for para el tope anti-spam.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!MARCA_ID) return Response.json({ message: 'Landings no configuradas' }, { status: 503 });
  const { slug } = await params;
  const body = await req.text();
  if (body.length > 20_000) return Response.json({ message: 'Solicitud demasiado grande' }, { status: 413 });
  try {
    const res = await fetch(`${API_URL}/public/landings/${encodeURIComponent(slug)}/registro?marcaId=${encodeURIComponent(MARCA_ID)}`, {
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
