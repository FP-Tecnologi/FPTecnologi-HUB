/*
 * Contenido actual de una página interna (defaults + lo guardado) para que el
 * CMS del dashboard arranque con los textos que hoy se ven en la web. Solo
 * lectura; guardar se hace contra la API central (con login). `home` y
 * `cotizador` tienen su propia ruta estática.
 */
import { PAGINAS, getPagina, type PaginaKey } from '@/lib/paginasContenido';

const DASHBOARD_ORIGIN = process.env.DASHBOARD_ORIGIN ?? 'http://localhost:3000';

export async function GET(_req: Request, { params }: { params: Promise<{ pagina: string }> }) {
  const { pagina } = await params;
  if (!PAGINAS.includes(pagina as PaginaKey)) return Response.json({ message: 'Página desconocida' }, { status: 404 });
  return Response.json(await getPagina(pagina as PaginaKey), {
    headers: { 'Access-Control-Allow-Origin': DASHBOARD_ORIGIN, 'Cache-Control': 'no-store' },
  });
}
