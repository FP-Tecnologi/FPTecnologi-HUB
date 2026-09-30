/*
 * Proxy del widget de chat hacia la API central (apps/api, /public/chat).
 * El navegador nunca habla directo con la API: así no hace falta CORS, la
 * URL de la API no queda expuesta y el marcaId lo pone el servidor (env),
 * no el cliente. Solo se reenvían estas 4 rutas; cualquier otra es 404.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

const ID = /^[0-9a-f-]{36}$/i;

function allowed(method: string, path: string[]): boolean {
  if (method === 'GET' && path.length === 1 && path[0] === 'asesores') return true;
  if (method === 'POST' && path.length === 1 && path[0] === 'conversaciones') return true;
  if (method === 'GET' && path.length === 2 && path[0] === 'conversaciones' && ID.test(path[1])) return true;
  if (method === 'POST' && path.length === 3 && path[0] === 'conversaciones' && ID.test(path[1]) && path[2] === 'mensajes') return true;
  return false;
}

async function forward(req: Request, path: string[]) {
  if (!MARCA_ID || !allowed(req.method, path)) return Response.json({ success: false }, { status: 404 });

  const incoming = new URL(req.url);
  const url = new URL(`${API_URL}/public/chat/${path.join('/')}`);
  url.searchParams.set('marcaId', MARCA_ID);
  for (const key of ['token', 'desde']) {
    const v = incoming.searchParams.get(key);
    if (v) url.searchParams.set(key, v);
  }

  try {
    const res = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? await req.text() : undefined,
      cache: 'no-store',
    });
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return Response.json({ success: false }, { status: 502 });
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: Request, { params }: Ctx) {
  return forward(req, (await params).path);
}

export async function POST(req: Request, { params }: Ctx) {
  return forward(req, (await params).path);
}
