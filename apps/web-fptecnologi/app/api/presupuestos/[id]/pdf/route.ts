/* PDF del presupuesto, generado por la API (se accede por el id del presupuesto, un UUID no adivinable). */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!MARCA_ID || !/^[0-9a-f-]{36}$/.test(id)) return new Response('No encontrado', { status: 404 });
  try {
    const res = await fetch(`${API_URL}/public/presupuestos/${id}/pdf?marcaId=${encodeURIComponent(MARCA_ID)}`, { cache: 'no-store' });
    if (!res.ok || !res.body) return new Response('No encontrado', { status: 404 });
    return new Response(res.body, { headers: { 'content-type': 'application/pdf', 'content-disposition': res.headers.get('content-disposition') ?? 'attachment; filename="presupuesto.pdf"', 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } });
  } catch {
    return new Response('No pudimos conectarnos', { status: 502 });
  }
}
