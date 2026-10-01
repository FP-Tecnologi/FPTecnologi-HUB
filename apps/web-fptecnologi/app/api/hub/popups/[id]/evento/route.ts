/* Proxy del conteo de vistas/clics de un popup (POST /public/popups/:id/evento). */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!MARCA_ID) return Response.json({ ok: false }, { status: 503 });
  const { id } = await params;
  const body = await req.text();
  if (body.length > 200) return Response.json({ ok: false }, { status: 413 });
  try {
    const res = await fetch(`${API_URL}/public/popups/${encodeURIComponent(id)}/evento?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
