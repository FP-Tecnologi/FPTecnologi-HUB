/*
 * Proxy de los PDF públicos subidos desde el dashboard (catálogos, documentos de Compliance). pdf.js los lee desde
 * el navegador y la API vive en otro origen: pasando por aquí no hay CORS y la API no queda expuesta. Solo sirve
 * la carpeta `catalogos` de la marca configurada de esta web.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function GET(_req: Request, { params }: { params: Promise<{ marca: string; carpeta: string; archivo: string }> }) {
  const { marca, carpeta, archivo } = await params;
  if (!MARCA_ID || marca !== MARCA_ID || carpeta !== 'catalogos' || !/^[0-9a-f-]{36}\.pdf$/.test(archivo)) {
    return new Response('No encontrado', { status: 404 });
  }
  const res = await fetch(`${API_URL}/uploads/${marca}/catalogos/${archivo}`, { cache: 'no-store' });
  if (!res.ok || !res.body) return new Response('No encontrado', { status: 404 });
  return new Response(res.body, {
    headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' },
  });
}
