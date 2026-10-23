/*
 * Imágenes de webs externas → copia en NUESTRO servidor (carpeta `UPLOADS_DIR/externas`).
 *
 * Si una foto o logo se guarda con la URL de otra web (el WordPress viejo, la web de una marca, un banco de imágenes),
 * cuando esa web la borra o se cae, la nuestra también se ve rota. Aquí se descarga una vez y se devuelve la URL propia
 * (`<PUBLIC_API_URL>/uploads/externas/<hash>.<ext>`). La usan la extensión de Prisma (al guardar cualquier dato) y el
 * script `prisma/seeds/localizar-imagenes.ts` (datos que ya estaban en la base).
 *
 * Nunca rompe un guardado: si la descarga falla, se deja la URL original y se registra en el log.
 * Solo imágenes reales (firma PNG/JPG/GIF/WEBP; SVG no, puede llevar scripts), hasta 10 MB, sin hosts internos.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tipoImagen, uploadsDir } from './uploads.service.js';

export const CARPETA_EXTERNAS = 'externas';
const MAX_BYTES = 10 * 1024 * 1024;
const TIEMPO_MS = 15_000;
const EXTENSIONES = ['png', 'jpg', 'gif', 'webp'];
const EXT_IMAGEN = /\.(png|jpe?g|gif|webp)$/i;
const HOST_INTERNO = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:)|\.(local|internal)$/i;

const baseApi = () => (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`).replace(/\/$/, '');

/** Dominios propios (sus imágenes ya son nuestras), salvo la carpeta del WordPress viejo `/wp-content/`. */
function propios(): Set<string> {
  const lista = (process.env.DOMINIOS_PROPIOS ?? 'fptecnologi.com,fimavperu.com,quamtu.com').split(',').map((d) => d.trim().toLowerCase().replace(/^www\./, '')).filter(Boolean);
  try {
    lista.push(new URL(baseApi()).hostname.toLowerCase().replace(/^www\./, ''));
  } catch {
    /* PUBLIC_API_URL mal escrita: se sigue con la lista */
  }
  return new Set(lista);
}

/** ¿Es una URL absoluta a una imagen de otra web que conviene copiar a nuestro servidor? */
export function esImagenExterna(valor: unknown): valor is string {
  if (typeof valor !== 'string' || valor.length > 2000 || !/^https?:\/\//i.test(valor)) return false;
  let url: URL;
  try {
    url = new URL(valor);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (HOST_INTERNO.test(host)) return false;
  const wordpress = url.pathname.includes('/wp-content/uploads/');
  if (!EXT_IMAGEN.test(url.pathname) && !wordpress) return false;
  return !propios().has(host.replace(/^www\./, '')) || wordpress;
}

const nombreDe = (url: string) => createHash('sha256').update(url).digest('hex').slice(0, 32);
const urlPropia = (archivo: string) => `${baseApi()}/uploads/${CARPETA_EXTERNAS}/${archivo}`;

const memo = new Map<string, Promise<string>>();

/** Descarga la imagen (una sola vez por URL) y devuelve la URL propia; si no se puede, la URL original. */
export function localizarImagen(url: string, fetcher: typeof fetch = fetch): Promise<string> {
  const previo = memo.get(url);
  if (previo) return previo;
  const p = descargar(url, fetcher).catch((e: Error) => {
    console.warn(`[imagenes-externas] no se pudo copiar ${url}: ${e.message}`);
    memo.delete(url); // se reintenta en el próximo guardado
    return url;
  });
  memo.set(url, p);
  if (memo.size > 5000) memo.delete(memo.keys().next().value!);
  return p;
}

async function descargar(url: string, fetcher: typeof fetch): Promise<string> {
  const base = nombreDe(url);
  const dir = join(uploadsDir(), CARPETA_EXTERNAS);
  const ya = EXTENSIONES.find((e) => existsSync(join(dir, `${base}.${e}`)));
  if (ya) return urlPropia(`${base}.${ya}`);
  const res = await fetcher(url, { redirect: 'follow', signal: AbortSignal.timeout(TIEMPO_MS), headers: { 'User-Agent': 'FPTecnologi-HUB/1.0 (copia de imagen propia)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (Number(res.headers.get('content-length') ?? 0) > MAX_BYTES) throw new Error('pesa más de 10 MB');
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_BYTES) throw new Error('pesa más de 10 MB');
  const tipo = tipoImagen(buffer);
  if (!tipo) throw new Error('no es una imagen PNG/JPG/GIF/WEBP');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${base}.${tipo.ext}`), buffer);
  return urlPropia(`${base}.${tipo.ext}`);
}

/**
 * Recorre un valor (texto, arreglo u objeto JSON) y cambia cada URL de imagen externa por su copia propia.
 * Devuelve el mismo valor si no había nada que cambiar.
 */
export async function localizarEnValor(valor: unknown, fetcher: typeof fetch = fetch, profundidad = 0): Promise<unknown> {
  if (profundidad > 8) return valor;
  if (esImagenExterna(valor)) return localizarImagen(valor, fetcher);
  if (Array.isArray(valor)) return Promise.all(valor.map((v) => localizarEnValor(v, fetcher, profundidad + 1)));
  if (valor && typeof valor === 'object' && Object.getPrototypeOf(valor) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor)) out[k] = await localizarEnValor(v, fetcher, profundidad + 1);
    return out;
  }
  return valor;
}

/** ¿Hay alguna imagen externa dentro de este valor? (para no tocar nada si no hace falta) */
export function tieneImagenExterna(valor: unknown, profundidad = 0): boolean {
  if (profundidad > 8) return false;
  if (esImagenExterna(valor)) return true;
  if (Array.isArray(valor)) return valor.some((v) => tieneImagenExterna(v, profundidad + 1));
  if (valor && typeof valor === 'object' && Object.getPrototypeOf(valor) === Object.prototype) return Object.values(valor).some((v) => tieneImagenExterna(v, profundidad + 1));
  return false;
}
