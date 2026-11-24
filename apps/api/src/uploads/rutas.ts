import { resolve } from 'node:path';

/** Carpeta donde se sirven las imágenes subidas (caché en disco; la copia permanente está en la base, ver almacen.ts). */
export const uploadsDir = () => resolve(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads'); // acepta ruta relativa o absoluta
