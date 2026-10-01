/*
 * Formulario de contacto y Libro de Reclamaciones -> API central
 * (POST /public/contacto). El navegador no habla directo con la API: el
 * marcaId lo pone el servidor y la IP real del visitante viaja en
 * x-forwarded-for para el tope anti-spam de la API.
 *
 * Copia opcional al sistema externo de Centralización de Leads: solo si están
 * definidas LEADS_SUPABASE_URL y LEADS_SUPABASE_ANON_KEY (nunca en el código).
 * Si esa copia falla no afecta al visitante: el HUB ya guardó el contacto.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';
const LEADS_URL = process.env.LEADS_SUPABASE_URL;
const LEADS_KEY = process.env.LEADS_SUPABASE_ANON_KEY;

type Entrada = { name?: string; email?: string; phone?: string; company?: string; message?: string; tipo?: string; origen?: string; website?: string };

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ error: 'Contacto no configurado' }, { status: 503 });

  let b: Entrada;
  try {
    b = (await req.json()) as Entrada;
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400 });
  }
  if (!b.name || !b.email || !b.message) {
    return Response.json({ error: 'Por favor ingresa tu nombre, correo y mensaje.' }, { status: 400 });
  }

  let origen = b.origen;
  if (!origen) {
    try {
      origen = new URL(req.headers.get('referer') ?? '').pathname;
    } catch {
      origen = undefined;
    }
  }

  try {
    const res = await fetch(`${API_URL}/public/contacto?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      },
      body: JSON.stringify({
        tipo: b.tipo === 'RECLAMO' ? 'RECLAMO' : 'CONTACTO',
        nombre: b.name,
        email: b.email,
        celular: b.phone || undefined,
        empresa: b.company || undefined,
        mensaje: b.message,
        origen,
        website: b.website || undefined,
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
      const msg = Array.isArray(j?.message) ? j.message.join(', ') : j?.message;
      return Response.json({ error: msg || 'No pudimos registrar tu mensaje. Inténtalo de nuevo.' }, { status: res.status });
    }
  } catch {
    return Response.json({ error: 'No pudimos conectarnos. Inténtalo de nuevo.' }, { status: 502 });
  }

  if (LEADS_URL && LEADS_KEY) {
    fetch(`${LEADS_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: LEADS_KEY, Authorization: `Bearer ${LEADS_KEY}`, Prefer: 'return=minimal' },
      body: JSON.stringify({
        nombres: b.name,
        email: b.email,
        telefono: b.phone || null,
        empresa: b.company || null,
        origen: b.tipo === 'RECLAMO' ? 'web-fptecnologi-reclamo' : 'web-fptecnologi-contacto',
        extra: { mensaje: b.message },
      }),
    }).catch((err) => console.error('Copia a leads externo falló:', err));
  }

  return Response.json({ success: true, message: '¡Gracias! Tu mensaje ha sido enviado exitosamente.' });
}
