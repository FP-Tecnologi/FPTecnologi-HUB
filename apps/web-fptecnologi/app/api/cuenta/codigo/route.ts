import { apiCuenta, marcaConfigurada } from '@/lib/cuenta';

/* Proxy: pide el código de acceso al correo (la API responde igual exista o no el correo). */
export async function POST(req: Request) {
  if (!marcaConfigurada()) return Response.json({ message: 'Mi cuenta no está configurada todavía.' }, { status: 503 });
  const body = await req.text();
  if (body.length > 2_000) return Response.json({ message: 'Solicitud demasiado grande.' }, { status: 413 });
  try {
    const res = await fetch(apiCuenta('codigo'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '' },
      body,
      cache: 'no-store',
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return Response.json({ message: 'No pudimos conectarnos. Intenta de nuevo.' }, { status: 502 });
  }
}
