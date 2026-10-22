/*
 * Proxy del formulario de /contacto hacia la API central del HUB (POST /public/contacto).
 * El marcaId (Fimav) lo pone el servidor y la IP real del visitante viaja en x-forwarded-for para el tope
 * anti-spam. Sin HUB_MARCA_ID responde 503 y el formulario ofrece WhatsApp y correo como respaldo.
 * Solo reenvía los campos del DTO: nunca campos desconocidos.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

const texto = (v: unknown) => (typeof v === 'string' ? v : undefined);

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ message: 'Contacto no configurado' }, { status: 503 });
  const raw = await req.text();
  if (raw.length > 10_000) return Response.json({ message: 'Solicitud demasiado grande' }, { status: 413 });

  let b: Record<string, unknown>;
  try {
    const p = JSON.parse(raw);
    if (!p || typeof p !== 'object' || Array.isArray(p)) throw new Error();
    b = p as Record<string, unknown>;
  } catch {
    return Response.json({ message: 'Solicitud inválida' }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/public/contacto?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body: JSON.stringify({
        tipo: 'CONTACTO',
        nombre: texto(b.nombre),
        email: texto(b.email),
        celular: texto(b.celular) || undefined,
        empresa: texto(b.empresa) || undefined,
        mensaje: texto(b.mensaje),
        origen: 'fimav-web/contacto',
        website: texto(b.website) || undefined,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return Response.json({ message: 'No pudimos conectarnos. Intenta de nuevo.' }, { status: 502 });
  }
}
