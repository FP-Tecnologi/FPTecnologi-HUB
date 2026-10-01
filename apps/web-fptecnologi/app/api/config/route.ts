/*
 * Configuración comercial que sale del servidor: tipo de cambio USD→PEN, editable en el dashboard
 * (Web informativa → Ajustes del sitio). (El IGV 18% es ley y vive en el carrito; los precios son USD sin IGV.)
 */
import { getSitio } from '@/lib/sitio';

export async function GET() {
  const { tipoCambio } = await getSitio();
  return Response.json({ tipoCambio }, { headers: { 'Cache-Control': 'public, max-age=60' } });
}
