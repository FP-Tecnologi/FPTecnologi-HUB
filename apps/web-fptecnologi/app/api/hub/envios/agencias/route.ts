/*
 * Proxy del checkout hacia el directorio de agencias Shalom de la API central:
 *   ?departamento=            -> provincias con agencias
 *   ?departamento=&provincia= -> agencias de esa provincia
 *   ?lat=&lng=[&departamento=] -> las 5 más cercanas a la ubicación del cliente
 * Es información pública de Shalom (no lleva marcaId ni datos del cliente). La ubicación solo se
 * usa para ordenar agencias: no se guarda.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const dep = q.get('departamento') ?? '';
  let ruta: string;
  const params = new URLSearchParams();
  if (q.get('lat') && q.get('lng')) {
    ruta = '/cercanas';
    params.set('lat', q.get('lat')!);
    params.set('lng', q.get('lng')!);
    if (dep) params.set('departamento', dep);
    if (q.get('departamentos')) params.set('departamentos', q.get('departamentos')!);
  } else if (dep && q.get('provincia') && q.get('distrito')) {
    ruta = '/por-distrito';
    params.set('departamento', dep);
    params.set('provincia', q.get('provincia')!);
    params.set('distrito', q.get('distrito')!);
  } else if (dep && q.get('provincia') && q.get('distritos')) {
    ruta = '/distritos';
    params.set('departamento', dep);
    params.set('provincia', q.get('provincia')!);
  } else if (dep && q.get('provincia')) {
    ruta = '';
    params.set('departamento', dep);
    params.set('provincia', q.get('provincia')!);
  } else if (dep) {
    ruta = '/provincias';
    params.set('departamento', dep);
  } else {
    return Response.json({ data: [] });
  }
  try {
    const res = await fetch(`${API_URL}/public/envios/agencias${ruta}?${params}`, ruta === '/cercanas' || ruta === '/por-distrito' ? { cache: 'no-store' } : { next: { revalidate: 3600 } });
    if (!res.ok) return Response.json({ data: [] });
    return Response.json({ data: (await res.json())?.data ?? (ruta === '/por-distrito' ? null : []) });
  } catch {
    return Response.json({ data: [] });
  }
}
