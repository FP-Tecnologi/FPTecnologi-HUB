/*
 * Copia permanente de los archivos públicos (`/uploads/…`). El disco del hosting se borra en cada despliegue, así que
 * cada archivo se guarda también en la base (`ArchivoSubido`); si falta en disco, se sirve desde ahí y se repone.
 *
 * ponytail: los bytes viven en Postgres (tope: la cuota de la base, 50 MB por archivo). Si crece, pasar a Supabase Storage.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import type { PrismaClient } from '../generated/prisma/client.js';
import { uploadsDir } from './rutas.js';

type Base = Pick<PrismaClient, 'archivoSubido'>;
let base: Base | null = null;

/** Se llama una vez al arrancar (main.ts y scripts). Sin base (tests), solo se escribe en disco. */
export const usarBase = (b: Base | null) => {
  base = b;
};

/** Solo nombres simples (`carpeta/.../archivo.ext`): sin `..`, barras invertidas ni archivos ocultos. */
const RUTA = /^(?:[\w-]+\/)+[\w-]+\.(png|jpg|gif|webp|pdf)$/;

async function escribir(ruta: string, datos: Uint8Array) {
  const destino = join(uploadsDir(), ruta);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, datos);
}

/** Guarda un archivo público; `ruta` es relativa a la carpeta de subidas. Si la base falla, la subida falla. */
export async function guardarPublico(ruta: string, buffer: Buffer) {
  const datos = new Uint8Array(buffer);
  await base?.archivoSubido.upsert({ where: { ruta }, create: { ruta, datos }, update: { datos } });
  await escribir(ruta, datos);
}

/** Va montado en `/uploads` DESPUÉS de los estáticos: atiende solo lo que no está en disco. */
export const servirDesdeBase = (cabeceras: (res: Response) => void) => async (req: Request, res: Response, next: NextFunction) => {
  const ruta = req.path.slice(1);
  if (!base || (req.method !== 'GET' && req.method !== 'HEAD') || !RUTA.test(ruta)) return next();
  try {
    const archivo = await base.archivoSubido.findUnique({ where: { ruta } });
    if (!archivo) return next();
    const datos = Buffer.from(archivo.datos);
    await escribir(ruta, datos).catch(() => undefined); // la próxima visita sale del disco
    cabeceras(res);
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.type(extname(ruta)).send(datos);
  } catch (e) {
    next(e);
  }
};
