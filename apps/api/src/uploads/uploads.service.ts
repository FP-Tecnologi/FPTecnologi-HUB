import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { escanear } from './antivirus.js';

export const MAX_BYTES = 5 * 1024 * 1024;
/** Evidencias de tickets (web pública): imágenes o PDF, hasta 10 MB. */
export const MAX_BYTES_EVIDENCIA = 10 * 1024 * 1024;

/** Catálogos PDF de la web pública (dashboard → Catálogos): hasta 50 MB. */
export const MAX_BYTES_CATALOGO = 50 * 1024 * 1024;

/** Material para socios (dashboard → Recursos): imágenes, PDF, video, Office y ZIP, hasta 100 MB. */
export const MAX_BYTES_RECURSO = 100 * 1024 * 1024;

/** Carpeta donde se guardan las imágenes subidas. En cPanel debe estar FUERA de la carpeta que se reemplaza al desplegar. */
export const uploadsDir = () => resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads'); // acepta ruta relativa o absoluta

/**
 * Carpeta PRIVADA (no se sirve por HTTP): recursos para socios y evidencias de tickets. Se descargan solo a través de
 * endpoints con sesión. En cPanel, igual que uploads, debe quedar fuera de la carpeta que se reemplaza al desplegar.
 */
export const privadoDir = () => resolve(process.cwd(), process.env.UPLOADS_PRIVADO_DIR ?? 'uploads-privado');

/** Ruta absoluta de una clave privada (`<marcaId>/<subcarpeta>/<uuid>.<ext>`); null si la clave no es válida o intenta salir de la carpeta. */
export function rutaPrivada(clave: string): string | null {
  if (!/^[0-9a-f-]{36}\/(recursos|evidencias)\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(clave)) return null;
  const abs = resolve(privadoDir(), clave);
  return abs.startsWith(privadoDir() + sep) ? abs : null;
}

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
    await escanear(archivo.buffer);
    return this.guardarPrivado(marcaId, archivo.buffer, tipo.ext, 'evidencias');
  }

  /** Archivo de un recurso para socios. El tipo se decide por los bytes reales; el nombre solo desambigua los Office/ZIP (comparten firma PK). */
  async guardarRecurso(marcaId: string, archivo?: { buffer: Buffer; size: number; originalname?: string }) {
    if (!archivo?.buffer?.length) throw new BadRequestException('Elige un archivo');
    if (archivo.size > MAX_BYTES_RECURSO) throw new BadRequestException('El archivo pesa más de 100 MB');
    const b = archivo.buffer;
    const img = tipoImagen(b);
    let ext: string;
    let tipo: 'IMAGEN' | 'PDF' | 'VIDEO' | 'DOCUMENTO' | 'OTRO';
    let mime: string;
    if (img) { ext = img.ext; tipo = 'IMAGEN'; mime = img.ext === 'jpg' ? 'image/jpeg' : `image/${img.ext}`; }
    else if (b.length > 5 && b.toString('ascii', 0, 5) === '%PDF-') { ext = 'pdf'; tipo = 'PDF'; mime = 'application/pdf'; }
    else if (b.length > 12 && b.toString('ascii', 4, 8) === 'ftyp') { ext = 'mp4'; tipo = 'VIDEO'; mime = 'video/mp4'; }
    else if (b.length > 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) { ext = 'webm'; tipo = 'VIDEO'; mime = 'video/webm'; }
    else if (b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) {
      const e = (archivo.originalname ?? '').split('.').pop()?.toLowerCase() ?? '';
      const office: Record<string, string> = {
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      };
      if (office[e]) { ext = e; tipo = 'DOCUMENTO'; mime = office[e]; }
      else if (e === 'zip') { ext = 'zip'; tipo = 'OTRO'; mime = 'application/zip'; }
      else throw new BadRequestException('Formato no válido');
    } else throw new BadRequestException('Formato no válido: usa imagen, PDF, video MP4/WEBM, Word/Excel/PowerPoint o ZIP');
    await escanear(b);
    const r = await this.guardarPrivado(marcaId, b, ext, 'recursos');
    return { ...r, tipo, mime, bytes: archivo.size };
  }

  private async guardarPrivado(marcaId: string, buffer: Buffer, ext: string, subcarpeta: 'recursos' | 'evidencias') {
    const nombre = `${randomUUID()}.${ext}`;
    await mkdir(join(privadoDir(), marcaId, subcarpeta), { recursive: true });
    await writeFile(join(privadoDir(), marcaId, subcarpeta, nombre), buffer);
    return { clave: `${marcaId}/${subcarpeta}/${nombre}` };
  }

  /**
   * Entrega un archivo privado (con soporte de Range para video). Quien llama ya validó la sesión Y que la clave
   * pertenece a la marca/recurso que esa sesión puede ver. `inline` = mostrarlo en la página (vista previa).
   */
  enviar(res: Response, clave: string, opciones: { nombre?: string; inline?: boolean } = {}) {
    const abs = rutaPrivada(clave);
    if (!abs) throw new NotFoundException('Archivo no encontrado');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    const nombre = (opciones.nombre ?? clave.split('/').pop() ?? 'archivo').replace(/[^\w. -]/g, '_');
    res.setHeader('Content-Disposition', `${opciones.inline ? 'inline' : 'attachment'}; filename="${nombre}"`);
    res.sendFile(abs, (err) => {
      if (err && !res.headersSent) res.status(404).json({ success: false, statusCode: 404, message: 'Archivo no encontrado' });
    });
  }

  /** Catálogo PDF público (se hojea en /catalogos): por su firma real, escaneado, bajo `<marca>/catalogos/` de la carpeta pública. */
  async guardarCatalogo(marcaId: string, archivo?: { buffer: Buffer; size: number }) {
    if (!archivo?.buffer?.length) throw new BadRequestException('Elige un PDF');
    if (archivo.size > MAX_BYTES_CATALOGO) throw new BadRequestException('El PDF pesa más de 50 MB');
    if (archivo.buffer.toString('ascii', 0, 5) !== '%PDF-') throw new BadRequestException('El archivo no es un PDF válido');
    await escanear(archivo.buffer);
    const carpeta = `${marcaId.replace(/[^a-zA-Z0-9-]/g, '')}/catalogos`;
    const nombre = `${randomUUID()}.pdf`;
    await mkdir(join(uploadsDir(), carpeta), { recursive: true });
    await writeFile(join(uploadsDir(), carpeta, nombre), archivo.buffer);
    return { ruta: `/uploads/${carpeta}/${nombre}` };
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
