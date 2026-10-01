/*
 * Proxy del checkout hacia GET /public/envios/tarifas: departamentos con envío,
 * costo (USD), plazo y agencias. Si la API no responde devuelve [] y la tienda
 * ofrece solo recojo o envío a coordinar. El costo final lo vuelve a calcular
 * la API al crear el pedido.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function GET() {
  if (!MARCA_ID) return Response.json({ data: [] });
  try {
    const res = await fetch(`${API_URL}/public/envios/tarifas?marcaId=${encodeURIComponent(MARCA_ID)}`, { next: { revalidate: 60 } });
    if (!res.ok) return Response.json({ data: [] });
    return Response.json({ data: (await res.json())?.data ?? [] });
  } catch {
    return Response.json({ data: [] });
  }
}
