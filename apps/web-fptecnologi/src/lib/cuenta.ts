/*
 * "Mi cuenta" del cliente: acceso sin contraseña con un código al correo. La sesión es un token firmado que
 * emite la API (por correo) y vive en una cookie httpOnly de ESTA web; el navegador nunca lo lee. Las páginas
 * de servidor lo mandan a la API en `x-cuenta-token`.
 */
export const COOKIE_CUENTA = 'fpt_cuenta';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export interface PedidoCuenta {
  id: string; numeroPedido: string | null; estado: 'PENDIENTE' | 'PAGADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO'; estadoPago: string; metodoPago: string | null;
  subtotal: string; igv: string; envio: string; total: string; moneda: string; createdAt: string; direccion: string | null; distrito: string | null;
  envioProveedor: string | null; envioDepartamento: string | null; envioSede: string | null; envioPlazo: string | null; trackingCodigo: string | null;
  items: { cantidad: number; subtotal: string; nombreSnapshot: string; skuSnapshot: string }[];
}
export interface CotizacionCuenta {
  id: string; numero: string | null; estado: 'PENDIENTE' | 'EN_REVISION' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA'; mensaje: string | null;
  propuesta: string | null; monto: string | null; moneda: string; validezHasta: string | null; enviadaAt: string | null; createdAt: string; servicio: { nombre: string };
}
export interface ResumenCuenta { socio?: boolean; email: string; nombre: string | null; celular: string | null; pedidos: PedidoCuenta[]; cotizaciones: CotizacionCuenta[] }

/** Datos de la cuenta, o null si no hay sesión / venció (la página muestra entonces el acceso por código). */
export async function getResumenCuenta(token: string | undefined): Promise<ResumenCuenta | null> {
  if (!token || !MARCA_ID) return null;
  try {
    const res = await fetch(`${API_URL}/public/cuenta/resumen?marcaId=${encodeURIComponent(MARCA_ID)}`, { headers: { 'x-cuenta-token': token }, cache: 'no-store' });
    if (!res.ok) return null;
    return ((await res.json())?.data ?? null) as ResumenCuenta | null;
  } catch {
    return null;
  }
}

export const apiCuenta = (ruta: 'codigo' | 'verificar') => `${API_URL}/public/cuenta/${ruta}?marcaId=${encodeURIComponent(MARCA_ID)}`;
export const marcaConfigurada = () => !!MARCA_ID;

export interface RecursoSocio {
  id: string; titulo: string; descripcion: string | null; tipo: 'IMAGEN' | 'PDF' | 'VIDEO' | 'DOCUMENTO' | 'OTRO';
  fabricante: string | null; categoria: string | null; archivoUrl: string; mime: string | null; bytes: number; createdAt: string;
}

/** Material para socios: `sinSesion` (hay que ingresar), `sinAcceso` (sesión de un correo que no es socio) o la lista. */
export async function getRecursosSocio(token: string | undefined): Promise<
  { estado: 'sinSesion' | 'sinAcceso' | 'error' } | { estado: 'ok'; socio: { nombre: string | null; empresa: string | null }; recursos: RecursoSocio[] }
> {
  if (!token || !MARCA_ID) return { estado: 'sinSesion' };
  try {
    const res = await fetch(`${API_URL}/public/recursos?marcaId=${encodeURIComponent(MARCA_ID)}`, { headers: { 'x-cuenta-token': token }, cache: 'no-store' });
    if (res.status === 401) return { estado: 'sinSesion' };
    if (res.status === 403) return { estado: 'sinAcceso' };
    if (!res.ok) return { estado: 'error' };
    const d = (await res.json())?.data;
    // Los archivos viven en la API (/uploads/...): se entregan con URL absoluta porque la web es otro origen.
    const recursos = (d.recursos as RecursoSocio[]).map((r) => ({ ...r, archivoUrl: r.archivoUrl.startsWith('/uploads/') ? `${API_URL}${r.archivoUrl}` : r.archivoUrl }));
    return { estado: 'ok', socio: d.socio, recursos };
  } catch {
    return { estado: 'error' };
  }
}
