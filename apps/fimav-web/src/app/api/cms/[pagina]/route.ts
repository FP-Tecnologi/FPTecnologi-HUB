/*
 * Contenido actual de una página (defaults + lo guardado) para que el CMS del dashboard (Administrador → Web Fimav)
 * arranque con los textos que hoy se ven en la web. Solo lectura y solo para el origen del dashboard; guardar se hace
 * contra la API central, con sesión.
 */
import { PAGINAS_CMS, getPagina, type PaginaCms } from '@/lib/cms';

// Orígenes que pueden leer (separados por coma). Por defecto, el dashboard de producción y el de desarrollo.
const PERMITIDOS = (process.env.DASHBOARD_ORIGIN ?? 'https://admin.fptecnologi.com,http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ pagina: string }> }) {
  const { pagina } = await params;
  if (!PAGINAS_CMS.includes(pagina as PaginaCms)) return Response.json({ message: 'Página desconocida' }, { status: 404 });
  const origen = req.headers.get('origin') ?? '';
  return Response.json(await getPagina(pagina as PaginaCms), {
    headers: { 'Access-Control-Allow-Origin': PERMITIDOS.includes(origen) ? origen : PERMITIDOS[0]!, 'Cache-Control': 'no-store', Vary: 'Origin' },
  });
}
