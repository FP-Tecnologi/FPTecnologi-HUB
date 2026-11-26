import { BadRequestException } from '@nestjs/common';
import { tipoImagen } from '../uploads/uploads.service.js';

/** Tope por archivo: los bytes viven en Postgres, así que se mantiene bajo (para videos largos, mejor un enlace). */
export const MAX_BYTES_EQUIPO = 25 * 1024 * 1024;

export const AREAS = ['GENERAL', 'MARKETING', 'COMERCIAL', 'VENTAS', 'SOPORTE', 'LOGISTICA', 'FINANZAS'] as const;
export const CATEGORIAS = ['LOGOS', 'IMAGENES', 'CORREOS', 'DOCUMENTOS', 'PLANTILLAS', 'PRESENTACIONES', 'VIDEOS', 'TIPOGRAFIAS', 'OTROS'] as const;

const OFFICE = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
} as const;

/** Extensión permitida → tipo MIME con el que se entrega. */
export const MIME_POR_EXT: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg',
  ...OFFICE, doc: 'application/msword', xls: 'application/vnd.ms-excel', ppt: 'application/vnd.ms-powerpoint',
  zip: 'application/zip', html: 'text/html', eml: 'message/rfc822', txt: 'text/plain', csv: 'text/csv',
  ai: 'application/postscript', eps: 'application/postscript', psd: 'image/vnd.adobe.photoshop',
  ttf: 'font/ttf', otf: 'font/otf', woff2: 'font/woff2',
};

const ascii = (b: Buffer, ini: number, fin: number) => b.toString('latin1', ini, fin);
const esTexto = (b: Buffer) => !b.subarray(0, 4096).includes(0);

/** Devuelve la extensión validada por los bytes reales (no confiamos en el mimetype que manda el navegador). */
export function validarFormato(nombre: string, b: Buffer): { ext: string; mime: string } {
  const ext = (nombre.split('.').pop() ?? '').toLowerCase();
  const mime = MIME_POR_EXT[ext];
  if (!mime || !nombre.includes('.')) throw new BadRequestException(`Formato .${ext || '?'} no permitido. Usa imágenes, SVG, PDF, Office, ZIP, HTML/EML (plantillas), AI/EPS/PSD, fuentes, MP4/WEBM o MP3.`);
  const falla = (): never => { throw new BadRequestException(`El archivo no es un .${ext} válido`); };
  const img = tipoImagen(b);
  switch (ext) {
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp':
      if (!img || (img.ext === 'jpg') !== (ext === 'jpg' || ext === 'jpeg') || (img.ext !== 'jpg' && img.ext !== ext)) falla();
      break;
    case 'svg': {
      const t = b.toString('utf8');
      // SVG puede llevar scripts: se acepta solo limpio (se entrega siempre como descarga o dentro de <img>, donde no corren).
      if (!/<svg[\s>]/i.test(t) || /<script|javascript:|\son\w+\s*=|<foreignObject|<iframe/i.test(t)) throw new BadRequestException('SVG no válido: no puede llevar scripts ni elementos incrustados');
      break;
    }
    case 'pdf': if (ascii(b, 0, 5) !== '%PDF-') falla(); break;
    case 'mp4': if (ascii(b, 4, 8) !== 'ftyp') falla(); break;
    case 'webm': if (!(b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3)) falla(); break;
    case 'mp3': if (!(ascii(b, 0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0))) falla(); break;
    case 'docx': case 'xlsx': case 'pptx': case 'zip': if (!(b[0] === 0x50 && b[1] === 0x4b)) falla(); break;
    case 'doc': case 'xls': case 'ppt': if (!(b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0)) falla(); break;
    case 'psd': if (ascii(b, 0, 4) !== '8BPS') falla(); break;
    case 'ai': if (!(ascii(b, 0, 5) === '%PDF-' || ascii(b, 0, 2) === '%!')) falla(); break;
    case 'eps': if (!(ascii(b, 0, 2) === '%!' || b[0] === 0xc5)) falla(); break;
    case 'html': case 'eml': case 'txt': case 'csv': if (!esTexto(b)) falla(); break;
    case 'ttf': if (!(b[0] === 0 && b[1] === 1 && b[2] === 0 && b[3] === 0) && ascii(b, 0, 4) !== 'true') falla(); break;
    case 'otf': if (ascii(b, 0, 4) !== 'OTTO') falla(); break;
    case 'woff2': if (ascii(b, 0, 4) !== 'wOF2') falla(); break;
  }
  return { ext, mime };
}

/** Tipos que el navegador puede mostrar sin descargar (vista previa): imágenes, SVG y PDF. */
export const PREVISUALIZABLE = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf', 'mp4', 'webm', 'mp3']);
