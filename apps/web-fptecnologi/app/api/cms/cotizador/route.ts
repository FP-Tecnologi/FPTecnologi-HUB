/*
 * Contenido actual del cotizador (defaults + lo guardado) para que el CMS del
 * dashboard arranque con lo que hoy se ve. Solo lectura; guardar se hace
 * contra la API central (con login).
 */
import { getCotizadorContenido } from '@/lib/cotizadorContenido';

const DASHBOARD_ORIGIN = process.env.DASHBOARD_ORIGIN ?? 'http://localhost:3000';

export async function GET() {
  return Response.json(await getCotizadorContenido(), {
    headers: { 'Access-Control-Allow-Origin': DASHBOARD_ORIGIN, 'Cache-Control': 'no-store' },
  });
}
