/* BBVA API Connect (two-legged OAuth v2): digest y firma HTTP de cada petición. Sin red ni base (se prueba aparte). */
import { createHash, createSign } from 'node:crypto';

/** Digest = SHA-512 del body exacto que se envía, en base64. Body vacío → hash de la cadena vacía. */
export function digest(body: string): string {
  return `SHA-512=${createHash('sha512').update(body).digest('base64')}`;
}

/** La clave llega como el archivo base64 que manda BBVA (PKCS#8 en PEM codificado) o como PEM directo. */
export function clavePem(valor: string): string {
  const v = valor.trim().replace(/\\n/g, '\n');
  return v.startsWith('-----BEGIN') ? v : Buffer.from(v, 'base64').toString('utf8').trim();
}

/** Cabeceras Digest, Signature y Date para una llamada firmada. */
export function cabecerasFirmadas(o: { metodo: string; path: string; host: string; body: string; clave: string; ahora?: Date }) {
  const ahora = o.ahora ?? new Date();
  const date = ahora.toUTCString();
  const dig = digest(o.body);
  const cadena = `(request-target):${o.metodo.toLowerCase()} ${o.path}\nhost:${o.host}\ndate:${date}\ndigest:${dig}`;
  const firma = createSign('RSA-SHA512').update(cadena).sign(clavePem(o.clave), 'base64');
  const expires = Math.floor(ahora.getTime() / 1000) + 3600;
  return {
    Digest: dig,
    Date: date,
    Signature: `algorithm="rsa-sha512",headers="(request-target) host date digest",expires="${expires}",signature="${firma}"`,
  };
}
