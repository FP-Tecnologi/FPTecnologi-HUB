/*
 * Proxy del Libro de Reclamaciones hacia la API central del HUB (POST /public/libro-reclamaciones).
 * El marcaId (Quamtu) lo pone el servidor y la IP real del visitante viaja en x-forwarded-for para el tope
 * anti-spam. Sin HUB_MARCA_ID responde 503 y el formulario ofrece correo y teléfono como respaldo.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ message: 'Libro de reclamaciones no configurado' }, { status: 503 });
  const body = await req.text();
  if (body.length > 20_000) return Response.json({ message: 'Solicitud demasiado grande' }, { status: 413 });

  try {
    const res = await fetch(`${API_URL}/public/libro-reclamaciones?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return Response.json({ message: 'No pudimos conectarnos. Intenta de nuevo.' }, { status: 502 });
  }
}
