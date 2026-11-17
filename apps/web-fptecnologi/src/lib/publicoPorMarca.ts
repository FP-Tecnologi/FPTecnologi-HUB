/*
 * Tarjetas y folletos pueden ser de cualquier marca (Fimav, Kelqa…), pero su enlace público cuelga de esta web.
 * La API exige la marca en cada consulta (a propósito), así que se prueba primero la de esta web y luego las demás.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

async function marcasPublicas(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/public/marcas`, { next: { revalidate: 300 } });
    const lista = ((await res.json())?.data ?? []) as { id: string }[];
    return lista.map((m) => m.id).filter((id) => id !== MARCA_ID);
  } catch {
    return [];
  }
}

/** Primera respuesta correcta de `ruta` (p. ej. `/public/tarjetas/ana`); `?marcaId=` se agrega solo. Null si ninguna marca la tiene. */
export async function buscarPorMarca(ruta: string, opciones: RequestInit = { cache: 'no-store' }): Promise<Response | null> {
  if (!MARCA_ID) return null;
  const probar = async (marcaId: string) => {
    try {
      const res = await fetch(`${API_URL}${ruta}?marcaId=${encodeURIComponent(marcaId)}`, opciones);
      return res.ok ? res : null;
    } catch {
      return null;
    }
  };
  const propia = await probar(MARCA_ID);
  if (propia) return propia;
  for (const id of await marcasPublicas()) {
    const res = await probar(id);
    if (res) return res;
  }
  return null;
}
