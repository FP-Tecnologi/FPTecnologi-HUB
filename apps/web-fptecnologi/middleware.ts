import { NextResponse, type NextRequest } from 'next/server';

/*
 * Modo "estamos trabajando": cuando se activa en el dashboard (Web informativa → Ajustes del sitio → Pantalla de
 * mantenimiento), todas las páginas públicas muestran /mantenimiento con estado 503 (así Google no la indexa como
 * contenido definitivo). Siguen funcionando las rutas /api, los archivos estáticos y el editor del dashboard
 * (vista previa con ?cms=…); el equipo puede recorrer toda la web con ?equipo=1 (queda una cookie de 8 horas).
 * El estado se lee de la API con una caché corta en memoria para no consultarla en cada visita.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';
const COOKIE_EQUIPO = 'fp_equipo';
const TTL_MS = 30_000;

let cache: { activo: boolean; hasta: number } | null = null;

async function mantenimientoActivo(): Promise<boolean> {
  if (!MARCA_ID) return false;
  const ahora = Date.now();
  if (cache && cache.hasta > ahora) return cache.activo;
  try {
    const res = await fetch(`${API_URL}/public/contenido/sitio?marcaId=${MARCA_ID}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    const data = ((await res.json())?.data ?? {}) as { mantenimiento?: { activo?: unknown } };
    const activo = data.mantenimiento?.activo === true;
    cache = { activo, hasta: ahora + TTL_MS };
    return activo;
  } catch {
    // Si la API no responde no bloqueamos el sitio: se mantiene lo último que se supo (o abierto).
    const activo = cache?.activo ?? false;
    cache = { activo, hasta: ahora + 5_000 };
    return activo;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // El equipo (o el editor del dashboard) entra a la web real aunque esté en mantenimiento.
  if (searchParams.has('equipo') || searchParams.has('cms')) {
    const res = NextResponse.next();
    if (searchParams.has('equipo')) res.cookies.set(COOKIE_EQUIPO, '1', { maxAge: 60 * 60 * 8, path: '/' });
    return res;
  }
  if (request.cookies.has(COOKIE_EQUIPO)) return NextResponse.next();

  if (!(await mantenimientoActivo())) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/mantenimiento';
  url.search = '';
  return NextResponse.rewrite(url, { status: 503, headers: { 'Retry-After': '3600', 'Cache-Control': 'no-store' } });
}

export const config = {
  // Se excluyen: la API interna, los recursos de Next, la propia pantalla, y cualquier archivo con extensión.
  matcher: ['/((?!api/|_next/|mantenimiento|robots\\.txt|sitemap\\.xml|favicon|.*\\..*).*)'],
};
