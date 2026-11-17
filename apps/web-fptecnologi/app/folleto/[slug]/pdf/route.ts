import { buscarPorMarca } from '@/lib/publicoPorMarca';

/* El PDF del folleto (guardado en la base de la API) pasa por aquí: pdf.js lo lee desde el navegador sin CORS y la API no queda expuesta. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return new Response('No encontrado', { status: 404 });
  const res = await buscarPorMarca(`/public/folletos/${slug}/pdf`);
  if (!res?.body) return new Response('No encontrado', { status: 404 });
  return new Response(res.body, {
    headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' },
  });
}
