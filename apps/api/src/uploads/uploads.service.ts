import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export const MAX_BYTES = 5 * 1024 * 1024;
/** Evidencias de tickets (web pública): imágenes o PDF, hasta 10 MB. */
export const MAX_BYTES_EVIDENCIA = 10 * 1024 * 1024;

/** Carpeta donde se guardan las imágenes subidas. En cPanel debe estar FUERA de la carpeta que se reemplaza al desplegar. */
export const uploadsDir = () => resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads'); // acepta ruta relativa o absoluta

/** Detecta el tipo real por los primeros bytes (no confiamos en el nombre ni en el mimetype que manda el cliente). SVG se rechaza a propósito (puede llevar scripts). */
export function tipoImagen(b: Buffer): { ext: string } | null {
  if (b.length > 12 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png' };
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg' };
  if (b.length > 6 && b.toString('ascii', 0, 4) === 'GIF8') return { ext: 'gif' };
  if (b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return { ext: 'webp' };
  return null;
}

// Tope por IP+marca para la subida pública de evidencias (el throttler global está deshabilitado).
const VENTANA_MS = 10 * 60_000;
const MAX_POR_VENTANA = 30;
const intentos = new Map<string, number[]>();

@Injectable()
export class UploadsService {
  /**
   * Evidencia de un ticket de soporte (web pública, sin login): solo imágenes, mismos límites que el dashboard,
   * en la subcarpeta `evidencias` de la marca y con un tope por IP.
   */
  async guardarEvidencia(marcaId: string, ip: string, archivo?: { buffer: Buffer; size: number }) {
    const ahora = Date.now();
    const clave = `${marcaId}:${ip}`;
    const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= MAX_POR_VENTANA) throw new HttpException('Demasiadas subidas seguidas. Intenta de nuevo en unos minutos.', HttpStatus.TOO_MANY_REQUESTS);
    recientes.push(ahora);
    intentos.set(clave, recientes);
    if (intentos.size > 5000) for (const [k, v] of intentos) if (!v.some((t) => ahora - t < VENTANA_MS)) intentos.delete(k);
    if (!archivo?.buffer?.length) throw new BadRequestException('Elige un archivo');
    if (archivo.size > MAX_BYTES_EVIDENCIA) throw new BadRequestException('El archivo pesa más de 10 MB');
    // PDF por su firma real (%PDF-); si no, debe ser una imagen válida (el nombre y el mimetype del cliente no se usan).
    const esPdf = archivo.buffer.length > 5 && archivo.buffer.toString('ascii', 0, 5) === '%PDF-';
    const tipo = esPdf ? { ext: 'pdf' } : tipoImagen(archivo.buffer);
    if (!tipo) throw new BadRequestException('Formato no válido: usa JPG, PNG, WEBP o PDF');
    return this.guardarBuffer(marcaId, archivo.buffer, tipo.ext, 'evidencias');
  }

  private async guardarBuffer(marcaId: string, buffer: Buffer, ext: string, subcarpeta?: string) {
    const carpeta = [marcaId.replace(/[^a-zA-Z0-9-]/g, ''), subcarpeta?.replace(/[^a-z]/g, '')].filter(Boolean).join('/');
    const nombre = `${randomUUID()}.${ext}`;
    await mkdir(join(uploadsDir(), carpeta), { recursive: true });
    await writeFile(join(uploadsDir(), carpeta, nombre), buffer);
    const base = (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`).replace(/\/$/, '');
    return { url: `${base}/uploads/${carpeta}/${nombre}`, ruta: `/uploads/${carpeta}/${nombre}` };
  }

  /** Guarda la imagen bajo la carpeta de la marca y devuelve su ruta pública (`/uploads/<marca>/<archivo>`). */
  async guardarImagen(marcaId: string, archivo?: { buffer: Buffer; size: number }, subcarpeta?: string) {
    if (!archivo?.buffer?.length) throw new BadRequestException('Elige una imagen');
    if (archivo.size > MAX_BYTES) throw new BadRequestException('La imagen pesa más de 5 MB');
    const tipo = tipoImagen(archivo.buffer);
    if (!tipo) throw new BadRequestException('Formato no válido: usa JPG, PNG, WEBP o GIF');
    // marcaId viene del guard (uuid verificado), pero se sanea igual: nunca debe poder salir de la carpeta.
    const carpeta = [marcaId.replace(/[^a-zA-Z0-9-]/g, ''), subcarpeta?.replace(/[^a-z]/g, '')].filter(Boolean).join('/');
    const nombre = `${randomUUID()}.${tipo.ext}`;
    await mkdir(join(uploadsDir(), carpeta), { recursive: true });
    await writeFile(join(uploadsDir(), carpeta, nombre), archivo.buffer);
    // Ruta absoluta: la web pública y el dashboard viven en otro origen que la API.
    const base = (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`).replace(/\/$/, '');
    return { url: `${base}/uploads/${carpeta}/${nombre}`, ruta: `/uploads/${carpeta}/${nombre}` };
  }
}
