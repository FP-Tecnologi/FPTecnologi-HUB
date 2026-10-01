import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export const MAX_BYTES = 5 * 1024 * 1024;

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

@Injectable()
export class UploadsService {
  /** Guarda la imagen bajo la carpeta de la marca y devuelve su ruta pública (`/uploads/<marca>/<archivo>`). */
  async guardarImagen(marcaId: string, archivo?: { buffer: Buffer; size: number }) {
    if (!archivo?.buffer?.length) throw new BadRequestException('Elige una imagen');
    if (archivo.size > MAX_BYTES) throw new BadRequestException('La imagen pesa más de 5 MB');
    const tipo = tipoImagen(archivo.buffer);
    if (!tipo) throw new BadRequestException('Formato no válido: usa JPG, PNG, WEBP o GIF');
    // marcaId viene del guard (uuid verificado), pero se sanea igual: nunca debe poder salir de la carpeta.
    const carpeta = marcaId.replace(/[^a-zA-Z0-9-]/g, '');
    const nombre = `${randomUUID()}.${tipo.ext}`;
    await mkdir(join(uploadsDir(), carpeta), { recursive: true });
    await writeFile(join(uploadsDir(), carpeta, nombre), archivo.buffer);
    // Ruta absoluta: la web pública y el dashboard viven en otro origen que la API.
    const base = (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`).replace(/\/$/, '');
    return { url: `${base}/uploads/${carpeta}/${nombre}`, ruta: `/uploads/${carpeta}/${nombre}` };
  }
}
