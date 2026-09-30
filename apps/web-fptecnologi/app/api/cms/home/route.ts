/*
 * Contenido actual de la home (defaults + lo guardado) para que el CMS del
 * dashboard arranque con los textos que hoy se ven en la web. Solo lectura;
 * guardar se hace contra la API central (con login).
 */
import { getHomeContenido } from '@/lib/homeContenido';

const DASHBOARD_ORIGIN = process.env.DASHBOARD_ORIGIN ?? 'http://localhost:3000';

export async function GET() {
  return Response.json(await getHomeContenido(), {
    headers: { 'Access-Control-Allow-Origin': DASHBOARD_ORIGIN, 'Cache-Control': 'no-store' },
  });
}
