/* BBVA API Connect (two-legged OAuth v2): digest y firma HTTP de cada petición. Sin red ni base (se prueba aparte). */
import { createHash, createSign } from 'node:crypto';

/** Digest = SHA-512 del body exacto que se envía, en base64. Body vacío → hash de la cadena vacía. */
export function digest(body: string): string {
  return `SHA-512=${createHash('sha512').update(body).digest('base64')}`;
}

/**
 * La clave llega en cualquiera de los formatos que entrega BBVA: PEM directo (PKCS#1 o PKCS#8), PEM codificado en
 * base64, o el PKCS#8 en base64 «pelado» (DER, sin encabezado -----BEGIN, como el Clave.p8 del sandbox).
 */
export function clavePem(valor: string): string {
  const v = valor.trim().replace(/\\n/g, '\n');
  if (v.startsWith('-----BEGIN')) return v;
  const b64 = v.replace(/\s+/g, '');
  const decodificado = Buffer.from(b64, 'base64').toString('utf8').trim();
  if (decodificado.startsWith('-----BEGIN')) return decodificado;
  return `-----BEGIN PRIVATE KEY-----\n${b64.match(/.{1,64}/g)!.join('\n')}\n-----END PRIVATE KEY-----`;
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
