/*
 * Proxy de la consulta de estado de una hoja (POST /public/libro-reclamaciones/consulta). El documento
 * viaja en el cuerpo, nunca en la URL. Se valida el tamaño antes de reenviar.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ message: 'Libro de reclamaciones no configurado' }, { status: 503 });
  const raw = await req.text();
  if (raw.length > 1024) return Response.json({ message: 'Solicitud demasiado grande' }, { status: 413 });
  let j: { codigo?: unknown; documento?: unknown } | null = null;
  try { j = JSON.parse(raw); } catch { /* 400 abajo */ }
  const { codigo, documento } = j ?? {};
  const ok = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 40;
  if (!ok(codigo) || !ok(documento)) return Response.json({ message: 'Código o documento inválido' }, { status: 400 });

  try {
    const res = await fetch(`${API_URL}/public/libro-reclamaciones/consulta?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body: JSON.stringify({ codigo, documento }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return Response.json({ message: 'No pudimos conectarnos. Intenta de nuevo.' }, { status: 502 });
  }
}
