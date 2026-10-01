/*
 * Lectura ÚNICA de los documentos que se suben al conocimiento del asistente: se extrae el texto (Word, Excel,
 * PDF, texto/markdown/CSV), se divide en fragmentos de ~900 caracteres con su título de sección y se guarda ya
 * troceado e indexado. El chat nunca vuelve a abrir el archivo: busca fragmentos.
 */
import { BadRequestException } from '@nestjs/common';

export const MAX_BYTES = 10 * 1024 * 1024;
export const MAX_FRAGMENTOS = 1500;
const MAX_CARACTERES = 600_000;
const OBJETIVO = 900; // caracteres por fragmento
const FILAS_POR_FRAGMENTO = 12;

export type TipoDoc = 'docx' | 'xlsx' | 'pdf' | 'txt' | 'md' | 'csv';
export interface Seccion { titulo: string; texto: string }
export interface Fragmento { titulo: string; texto: string }

/** Minúsculas, sin tildes ni signos: lo que se indexa y lo que se busca (así "instalación" = "instalacion"). */
export const normalizar = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();

const ZIP = (b: Buffer) => b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
const PDF = (b: Buffer) => b.length > 5 && b.toString('latin1', 0, 5) === '%PDF-';
const extension = (nombre: string) => (nombre.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? '');

/** Decide el tipo por los bytes reales y la extensión (no se confía solo en el nombre). */
export function detectarTipo(buffer: Buffer, nombre: string): TipoDoc {
  const ext = extension(nombre);
  if (PDF(buffer)) return 'pdf';
  if (ZIP(buffer)) {
    if (ext === 'docx') return 'docx';
    if (ext === 'xlsx') return 'xlsx';
    throw new BadRequestException('Formato no admitido: usa Word (.docx) o Excel (.xlsx). Los .doc y .xls antiguos guárdalos como .docx/.xlsx');
  }
  if (['txt', 'md', 'csv'].includes(ext)) {
    if (buffer.includes(0)) throw new BadRequestException('El archivo no es de texto');
    return ext as TipoDoc;
  }
  throw new BadRequestException('Formato no admitido: sube Word (.docx), Excel (.xlsx), PDF, texto (.txt/.md) o .csv');
}

// ------------------------------------------------------------------ extracción

/** HTML de mammoth → texto con "# Título" en los encabezados y "a | b" en las filas de tabla. */
function htmlATexto(html: string): string {
  return html
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, _n, t: string) => `\n\n# ${t.replace(/<[^>]+>/g, '').trim()}\n`)
    .replace(/<\/(td|th)>/gi, ' | ')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/(p|li|div)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+\|[ \t]*\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

/** Divide un texto con líneas "# Título" (markdown) en secciones. */
export function seccionesDeTexto(texto: string, tituloBase: string): Seccion[] {
  const secciones: Seccion[] = [];
  let titulo = tituloBase;
  let acc: string[] = [];
  const cerrar = () => {
    const t = acc.join('\n').trim();
    if (t) secciones.push({ titulo, texto: t });
    acc = [];
  };
  for (const linea of texto.replace(/\r/g, '').split('\n')) {
    const h = linea.match(/^\s{0,3}#{1,6}\s+(.*\S)\s*$/);
    if (h) { cerrar(); titulo = h[1].trim(); } else acc.push(linea);
  }
  cerrar();
  return secciones;
}

function csvAFilas(texto: string): string[][] {
  const lineas = texto.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  const sep = (lineas[0]?.match(/;/g)?.length ?? 0) > (lineas[0]?.match(/,/g)?.length ?? 0) ? ';' : ',';
  return lineas.map((l) => l.split(sep).map((c) => c.replace(/^"|"$/g, '').trim()));
}

/** Una hoja/CSV → secciones de ~12 filas, cada fila como "Columna: valor; Columna: valor" (así se entiende sola). */
export function filasASecciones(nombreHoja: string, filas: unknown[][]): Seccion[] {
  const limpias = filas.map((f) => f.map((c) => (c == null ? '' : String(c).trim()))).filter((f) => f.some(Boolean));
  if (limpias.length === 0) return [];
  const [cab, ...datos] = limpias;
  const tieneCabecera = datos.length > 0 && cab.filter(Boolean).length >= 2;
  const filasTxt = (tieneCabecera ? datos : limpias).map((f) =>
    f.map((v, i) => (v ? (tieneCabecera && cab[i] ? `${cab[i]}: ${v}` : v) : '')).filter(Boolean).join('; '),
  );
  const out: Seccion[] = [];
  for (let i = 0; i < filasTxt.length; i += FILAS_POR_FRAGMENTO) {
    const bloque = filasTxt.slice(i, i + FILAS_POR_FRAGMENTO);
    out.push({ titulo: filasTxt.length > FILAS_POR_FRAGMENTO ? `${nombreHoja} (filas ${i + 1}-${i + bloque.length})` : nombreHoja, texto: bloque.join('\n') });
  }
  return out;
}

export async function extraerSecciones(buffer: Buffer, nombre: string, tipo: TipoDoc): Promise<Seccion[]> {
  const base = nombre.replace(/\.[^.]+$/, '');
  try {
    if (tipo === 'docx') {
      const mammoth = (await import('mammoth')).default;
      const { value } = await mammoth.convertToHtml({ buffer });
      return seccionesDeTexto(htmlATexto(value), base);
    }
    if (tipo === 'xlsx') {
      const { default: leer } = await import('read-excel-file/node');
      const out: Seccion[] = [];
      for (const { sheet, data } of await leer(buffer)) out.push(...filasASecciones(sheet, data as unknown[][]));
      return out;
    }
    if (tipo === 'pdf') {
      const { extractText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return seccionesDeTexto(text, base);
    }
    const texto = buffer.toString('utf8');
    if (tipo === 'csv') return filasASecciones(base, csvAFilas(texto));
    return seccionesDeTexto(texto, base);
  } catch (e) {
    if (e instanceof BadRequestException) throw e;
    throw new BadRequestException('No se pudo leer el archivo: ¿está dañado o protegido con contraseña?');
  }
}

// ------------------------------------------------------------------ troceado

/** Corta una sección en fragmentos de ~OBJETIVO caracteres respetando párrafos (y líneas, si un párrafo es enorme). */
export function trocear(secciones: Seccion[]): Fragmento[] {
  const out: Fragmento[] = [];
  for (const s of secciones) {
    const partes = s.texto.split(/\n{2,}|\n(?=[-•*]\s)/).flatMap((p) => (p.length > OBJETIVO * 1.5 ? p.split(/(?<=[.;:])\s+|\n/) : [p])).map((p) => p.trim()).filter(Boolean);
    let acc = '';
    const volcar = () => { if (acc.trim()) out.push({ titulo: s.titulo, texto: acc.trim() }); acc = ''; };
    for (const p of partes) {
      if (acc && acc.length + p.length + 1 > OBJETIVO) volcar();
      acc += (acc ? '\n' : '') + p;
    }
    volcar();
  }
  return out;
}

export interface Resultado { tipo: TipoDoc; fragmentos: Fragmento[] }

export async function procesarDocumento(buffer: Buffer, nombre: string): Promise<Resultado> {
  if (!buffer?.length) throw new BadRequestException('Elige un archivo');
  if (buffer.length > MAX_BYTES) throw new BadRequestException('El archivo pesa más de 10 MB');
  const tipo = detectarTipo(buffer, nombre);
  const secciones = await extraerSecciones(buffer, nombre, tipo);
  const total = secciones.reduce((s, x) => s + x.texto.length, 0);
  if (total === 0) throw new BadRequestException('No encontramos texto en el archivo (¿es un PDF escaneado o está vacío?)');
  if (total > MAX_CARACTERES) throw new BadRequestException('El documento es demasiado largo: divídelo en partes');
  const fragmentos = trocear(secciones);
  if (fragmentos.length > MAX_FRAGMENTOS) throw new BadRequestException('El documento genera demasiados fragmentos: divídelo en partes');
  return { tipo, fragmentos };
}

// ------------------------------------------------------------------ consulta

const PARADAS = new Set(['que', 'como', 'cual', 'cuales', 'cuanto', 'cuantos', 'cuando', 'donde', 'quien', 'para', 'por', 'con', 'sin', 'del', 'los', 'las', 'una', 'uno', 'unos', 'unas', 'hay', 'son', 'ser', 'tiene', 'tienen', 'hacen', 'hace', 'puedo', 'pueden', 'quiero', 'necesito', 'hola', 'buenas', 'gracias', 'favor', 'sobre', 'esta', 'este', 'esto', 'mas', 'muy', 'sus', 'mis', 'nos', 'ustedes', 'tengo', 'saber', 'informacion']);

/** Términos de búsqueda de una pregunta: sin tildes, sin palabras vacías, únicos y máx. 10. */
export function terminosDe(pregunta: string): string[] {
  const t = normalizar(pregunta).split(' ').filter((w) => w.length >= 3 && !PARADAS.has(w) && /^[a-z0-9ñ]+$/.test(w));
  return [...new Set(t)].slice(0, 10);
}
