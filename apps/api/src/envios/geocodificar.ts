/*
 * Dirección escrita por el cliente -> coordenadas, con Nominatim (OpenStreetMap): gratis y sin clave. Su política pide
 * máx. 1 consulta por segundo, un User-Agent que nos identifique y no abusar: por eso las consultas salen en cola desde
 * el servidor (nunca desde el navegador), con caché y tope por IP. Las calles de Perú están a medias en OSM, así que si
 * la dirección exacta no aparece se cae a una zona más amplia (distrito/ciudad) y se avisa que es aproximada.
 */
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

export interface Ubicacion { lat: number; lng: number; lugar: string; aproximada: boolean }

const URL_NOMINATIM = process.env.NOMINATIM_URL ?? 'https://nominatim.openstreetmap.org/search';
const AGENTE = 'FPTecnologi-HUB/1.0 (ventasweb@fptecnologi.com)';
const INTERVALO_MS = 1100;
const CACHE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHE = 500;
const VENTANA_MS = 10 * 60_000;
const MAX_POR_IP = 20;

const cache = new Map<string, { at: number; v: Ubicacion | null }>();
const porIp = new Map<string, number[]>();
let cola: Promise<unknown> = Promise.resolve();
let ultima = 0;

const limpiar = (s: string) => s.replace(/\s+/g, ' ').trim();
const enPeru = (lat: number, lng: number) => lat > -19 && lat < 0.5 && lng > -82 && lng < -68;

/** De la dirección completa a zonas cada vez más amplias: "Jr. X 123, Breña, Lima" -> "Breña, Lima" -> "Lima". */
export function consultasDe(direccion: string): { q: string; aproximada: boolean }[] {
  const partes = limpiar(direccion).split(/[,;]/).map(limpiar).filter(Boolean);
  const out: { q: string; aproximada: boolean }[] = [{ q: `${partes.join(', ')}, Perú`, aproximada: false }];
  if (partes.length > 2) out.push({ q: `${partes.slice(-2).join(', ')}, Perú`, aproximada: true });
  if (partes.length > 1) out.push({ q: `${partes[partes.length - 1]}, Perú`, aproximada: true });
  return [...new Map(out.map((o) => [o.q, o])).values()].slice(0, 3);
}

function limitar(ip: string) {
  const ahora = Date.now();
  const r = (porIp.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (r.length >= MAX_POR_IP) throw new HttpException('Demasiadas búsquedas seguidas. Espera unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
  r.push(ahora);
  porIp.set(ip, r);
  if (porIp.size > 5000) for (const [k, v] of porIp) if (!v.some((t) => ahora - t < VENTANA_MS)) porIp.delete(k);
}

/** Una consulta a Nominatim respetando 1/s (cola global). */
function consultar(q: string): Promise<{ lat: number; lng: number; lugar: string } | null> {
  const tarea = cola.then(async () => {
    const espera = ultima + INTERVALO_MS - Date.now();
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultima = Date.now();
    const u = new URL(URL_NOMINATIM);
    u.search = new URLSearchParams({ q, format: 'jsonv2', countrycodes: 'pe', limit: '1' }).toString();
    const res = await fetch(u, { headers: { 'User-Agent': AGENTE, 'Accept-Language': 'es' }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const d = (await res.json()) as { lat: string; lon: string; display_name: string }[];
    const x = d[0];
    if (!x) return null;
    const lat = Number(x.lat);
    const lng = Number(x.lon);
    return enPeru(lat, lng) ? { lat, lng, lugar: x.display_name.split(',').slice(0, 3).join(',').trim() } : null;
  });
  cola = tarea.catch(() => undefined);
  return tarea;
}

export async function geocodificar(direccion: string, ip: string): Promise<Ubicacion | null> {
  const texto = limpiar(direccion);
  if (texto.length < 4 || texto.length > 200) throw new BadRequestException('Escribe tu dirección (calle, distrito y ciudad)');
  const clave = texto.toLowerCase();
  const hit = cache.get(clave);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.v;
  limitar(ip);

  let resultado: Ubicacion | null = null;
  try {
    for (const c of consultasDe(texto)) {
      const r = await consultar(c.q);
      if (r) { resultado = { ...r, aproximada: c.aproximada }; break; }
    }
  } catch {
    throw new HttpException('No pudimos buscar la dirección ahora. Elige tu departamento manualmente.', HttpStatus.SERVICE_UNAVAILABLE);
  }
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
  cache.set(clave, { at: Date.now(), v: resultado });
  return resultado;
}
