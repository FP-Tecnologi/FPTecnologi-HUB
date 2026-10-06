import { BadRequestException, Logger } from '@nestjs/common';
import { Socket } from 'node:net';

const logger = new Logger('Antivirus');

/** Cadena de prueba estándar EICAR: todo antivirus (y este filtro) la trata como malware. */
const EICAR = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

/** Extensiones de ejecutables/scripts que no deben viajar dentro de un ZIP u Office. */
const EXT_PELIGROSAS = /\.(exe|dll|scr|com|bat|cmd|ps1|vbs|vbe|js|jse|wsf|msi|jar|lnk|hta|cpl|reg|sh|apk)$/i;

/**
 * Filtro propio, siempre activo (sin dependencias): firmas de ejecutables, EICAR, PDFs con acciones activas
 * (JavaScript / Launch), macros de Office y ZIPs con ejecutables dentro. Los nombres de un ZIP viajan en claro en su
 * directorio central, así que se leen sin descomprimir.
 */
export function escaneoBasico(b: Buffer): string | null {
  if (b.length > 2 && b[0] === 0x4d && b[1] === 0x5a) return 'archivo ejecutable de Windows';
  if (b.length > 4 && b[0] === 0x7f && b.toString('ascii', 1, 4) === 'ELF') return 'archivo ejecutable de Linux';
  if (b.length > 4 && (b.readUInt32BE(0) === 0xfeedface || b.readUInt32BE(0) === 0xfeedfacf || b.readUInt32BE(0) === 0xcafebabe)) return 'archivo ejecutable';
  if (b.toString('latin1', 0, 2) === '#!') return 'script ejecutable';
  const txt = b.toString('latin1');
  if (txt.includes(EICAR)) return 'firma de prueba de virus (EICAR)';
  if (txt.startsWith('%PDF-') && /\/(JavaScript|JS|Launch|EmbeddedFile)\b/.test(txt)) return 'PDF con acciones activas (JavaScript o archivos incrustados)';
  if (txt.startsWith('PK\x03\x04')) {
    if (txt.includes('vbaProject.bin')) return 'documento con macros';
    const nombres = txt.match(/[\w ./()-]{1,200}\.(?:exe|dll|scr|com|bat|cmd|ps1|vbs|vbe|js|jse|wsf|msi|jar|lnk|hta|cpl|reg|sh|apk)(?=PK|[^\w])/gi);
    if (nombres?.some((n) => EXT_PELIGROSAS.test(n.trim()))) return 'archivo comprimido con ejecutables dentro';
  }
  return null;
}

/** ClamAV por el protocolo INSTREAM de clamd (TCP). Devuelve el nombre de la firma si hay virus, null si está limpio. */
function clamd(buf: Buffer, host: string, port: number): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const s = new Socket();
    let resp = '';
    s.setTimeout(30_000, () => s.destroy(new Error('clamd: tiempo agotado')));
    s.on('error', reject);
    s.on('data', (d) => (resp += d.toString()));
    s.on('close', () => {
      const m = resp.match(/stream: (.+) FOUND/);
      if (m) return resolve(m[1]);
      if (/OK/.test(resp)) return resolve(null);
      reject(new Error(`clamd: respuesta inesperada "${resp.trim()}"`));
    });
    s.connect(port, host, () => {
      s.write('zINSTREAM\0');
      for (let i = 0; i < buf.length; i += 64 * 1024) {
        const parte = buf.subarray(i, i + 64 * 1024);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(parte.length);
        s.write(len);
        s.write(parte);
      }
      s.write(Buffer.alloc(4)); // fin del stream
    });
  });
}

/**
 * Escanea un archivo recibido (recursos del dashboard y evidencias de tickets). Siempre pasa por el filtro básico;
 * además, con CLAMAV_HOST (y CLAMAV_PORT, 3310 por defecto) lo revisa ClamAV. Si ClamAV está configurado pero no
 * responde, el archivo se rechaza (falla cerrado) salvo CLAMAV_OPCIONAL=1.
 */
export async function escanear(buf: Buffer): Promise<void> {
  const basico = escaneoBasico(buf);
  if (basico) throw new BadRequestException(`Archivo rechazado: ${basico}.`);
  const host = process.env.CLAMAV_HOST;
  if (!host) return;
  try {
    const virus = await clamd(buf, host, Number(process.env.CLAMAV_PORT ?? 3310));
    if (virus) {
      logger.warn(`ClamAV detectó ${virus}`);
      throw new BadRequestException('Archivo rechazado: el antivirus detectó una amenaza.');
    }
  } catch (e) {
    if (e instanceof BadRequestException) throw e;
    logger.error('ClamAV no disponible', e as Error);
    if (process.env.CLAMAV_OPCIONAL !== '1') throw new BadRequestException('No se pudo verificar el archivo con el antivirus. Inténtalo más tarde.');
  }
}
