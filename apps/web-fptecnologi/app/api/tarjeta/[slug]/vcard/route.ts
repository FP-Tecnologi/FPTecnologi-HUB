import { buscarPorMarca } from '@/lib/publicoPorMarca';

/* «Guardar contacto»: el .vcf lo genera la API; aquí solo se reenvía para no exponerla ni lidiar con CORS. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) return new Response('No encontrado', { status: 404 });
  const res = await buscarPorMarca(`/public/tarjetas/${slug}/vcard`);
  if (!res) return new Response('No encontrado', { status: 404 });
  return new Response(await res.text(), { headers: { 'content-type': 'text/vcard; charset=utf-8', 'content-disposition': res.headers.get('content-disposition') ?? 'attachment; filename="contacto.vcf"', 'cache-control': 'no-store' } });
}
