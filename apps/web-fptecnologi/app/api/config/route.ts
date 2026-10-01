/*
 * Configuración comercial que sale del servidor (no hardcodeada en el cliente):
 * tipo de cambio USD→PEN. Se cambia con la variable TIPO_CAMBIO_USD_PEN sin
 * tocar código. (El IGV 18% es ley y vive en el carrito; los precios son USD sin IGV.)
 */
const TIPO_CAMBIO = Number(process.env.TIPO_CAMBIO_USD_PEN);

export async function GET() {
  return Response.json(
    { tipoCambio: Number.isFinite(TIPO_CAMBIO) && TIPO_CAMBIO > 0 ? TIPO_CAMBIO : 3.75 },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
