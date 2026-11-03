/*
 * Llamadas del navegador a la API central del HUB (/public/*). La web es estática (sin servidor propio), así que el
 * navegador habla directo con la API; el marcaId es público y la API valida origen (CORS) y tope anti-spam por IP.
 * Sin configurar, lanza error y cada formulario cae a su respaldo (WhatsApp / correo).
 */
const API = process.env.NEXT_PUBLIC_HUB_API_URL ?? '';
const MARCA = process.env.NEXT_PUBLIC_HUB_MARCA_ID ?? '';

export function hubFetch(ruta: string, init?: RequestInit) {
  if (!API || !MARCA) return Promise.reject(new Error('HUB no configurado'));
  return fetch(`${API}/public/${ruta}?marcaId=${encodeURIComponent(MARCA)}`, { cache: 'no-store', ...init });
}

export const hubJson = (ruta: string, body: unknown) =>
  hubFetch(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** Mensaje de error de la API (string o lista) o el de respaldo. */
export const hubMensaje = (j: { message?: string | string[] } | null | undefined, respaldo: string) =>
  (Array.isArray(j?.message) ? j.message.join(' ') : j?.message) || respaldo;
