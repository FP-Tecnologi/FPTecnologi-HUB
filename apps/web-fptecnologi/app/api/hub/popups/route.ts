/*
 * Proxy de los popups de la web hacia la API central (GET /public/popups?pagina=). El navegador no habla
 * directo con la API: el marcaId lo pone el servidor y las imágenes subidas desde el dashboard (/uploads/…)
 * se vuelven absolutas hacia la API, porque el navegador no tiene esa dirección.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

const absoluta = (u: unknown) => (typeof u === 'string' && u.startsWith('/uploads/') ? `${API_URL}${u}` : u);

export async function GET(req: Request) {
  if (!MARCA_ID) return Response.json({ data: [] });
  const pagina = new URL(req.url).searchParams.get('pagina') ?? 'otras';
  try {
    const res = await fetch(`${API_URL}/public/popups?marcaId=${encodeURIComponent(MARCA_ID)}&pagina=${encodeURIComponent(pagina.slice(0, 30))}`, { cache: 'no-store' });
    if (!res.ok) return Response.json({ data: [] });
    const json = (await res.json()) as { data?: { contenido?: { imagenUrl?: string }; producto?: { imagen?: string } | null }[] };
    const data = (json.data ?? []).map((p) => ({
      ...p,
      contenido: p.contenido ? { ...p.contenido, imagenUrl: absoluta(p.contenido.imagenUrl) } : p.contenido,
      producto: p.producto ? { ...p.producto, imagen: absoluta(p.producto.imagen) } : null,
    }));
    return Response.json({ data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ data: [] });
  }
}
