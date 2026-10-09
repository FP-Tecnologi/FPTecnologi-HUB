/* «Guardar contacto»: el .vcf lo genera la API; aquí solo se reenvía para no exponerla ni lidiar con CORS. */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!MARCA_ID || !/^[a-z0-9-]{3,60}$/.test(slug)) return new Response('No encontrado', { status: 404 });
  try {
    const res = await fetch(`${API_URL}/public/tarjetas/${slug}/vcard?marcaId=${encodeURIComponent(MARCA_ID)}`, { cache: 'no-store' });
    if (!res.ok) return new Response('No encontrado', { status: 404 });
    return new Response(await res.text(), { headers: { 'content-type': 'text/vcard; charset=utf-8', 'content-disposition': res.headers.get('content-disposition') ?? 'attachment; filename="contacto.vcf"', 'cache-control': 'no-store' } });
  } catch {
    return new Response('No pudimos conectarnos', { status: 502 });
  }
}
