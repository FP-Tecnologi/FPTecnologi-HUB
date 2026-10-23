/*
 * Contenido actual de una página (defaults + lo guardado) para que el CMS del dashboard (Administrador → Web Fimav)
 * arranque con los textos que hoy se ven en la web. Solo lectura y solo para el origen del dashboard; guardar se hace
 * contra la API central, con sesión.
 */
import { PAGINAS_CMS, getPagina, type PaginaCms } from '@/lib/cms';

const DASHBOARD_ORIGIN = process.env.DASHBOARD_ORIGIN ?? 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ pagina: string }> }) {
  const { pagina } = await params;
  if (!PAGINAS_CMS.includes(pagina as PaginaCms)) return Response.json({ message: 'Página desconocida' }, { status: 404 });
  return Response.json(await getPagina(pagina as PaginaCms), {
    headers: { 'Access-Control-Allow-Origin': DASHBOARD_ORIGIN, 'Cache-Control': 'no-store', Vary: 'Origin' },
  });
}
