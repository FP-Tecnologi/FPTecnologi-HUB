import PDFDocument from 'pdfkit';
import type { PrismaService } from '../prisma/prisma.service.js';

/** Datos de la empresa que van en el encabezado de los documentos (se leen del CMS «Ajustes del sitio»). */
export interface EmpresaPdf {
  nombre: string;
  direccion: string;
  contacto: string;
}

export interface DocumentoPdf {
  empresa: EmpresaPdf;
  /** «Presupuesto», «Cotización»… */
  tipo: string;
  numero: string;
  /** Pares etiqueta → valor bajo el título (cliente, fechas, validez…). */
  meta: [string, string][];
  tabla?: { columnas: string[]; anchos: number[]; filas: string[][] };
  totales?: [string, string][];
  /** Bloques de texto con título (propuesta, notas…). */
  textos?: { titulo: string; texto: string }[];
  pie?: string;
}

const AZUL = '#2898ee';
const TINTA = '#0b1b26';
const GRIS = '#5b6b78';

/** Documento A4 simple (encabezado, datos, tabla, totales, textos) como Buffer. Sin plantillas: lo justo para presupuestos y cotizaciones. */
export function generarPdf(d: DocumentoPdf): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `${d.tipo} ${d.numero}`, Author: d.empresa.nombre } });
    const partes: Buffer[] = [];
    doc.on('data', (b: Buffer) => partes.push(b));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);

    const ancho = doc.page.width - 96;
    doc.font('Helvetica-Bold').fontSize(18).fillColor(TINTA).text(d.empresa.nombre, 48, 48);
    doc.font('Helvetica').fontSize(9).fillColor(GRIS).text(d.empresa.direccion).text(d.empresa.contacto);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(AZUL).text(d.tipo.toUpperCase(), 48, 48, { width: ancho, align: 'right' });
    doc.fontSize(16).fillColor(TINTA).text(d.numero, 48, 62, { width: ancho, align: 'right' });
    doc.moveTo(48, 100).lineTo(48 + ancho, 100).lineWidth(2).strokeColor(AZUL).stroke();
    doc.y = 116;

    for (const [k, v] of d.meta) {
      const y = doc.y;
      doc.font('Helvetica').fontSize(9).fillColor(GRIS).text(k, 48, y, { width: 110 });
      doc.font('Helvetica-Bold').fontSize(10).fillColor(TINTA).text(v || '—', 160, y, { width: ancho - 112 });
      doc.y = Math.max(doc.y, y + 14);
    }

    if (d.tabla) {
      doc.moveDown(1);
      const { columnas, anchos, filas } = d.tabla;
      const x0 = 48;
      const fila = (celdas: string[], negrita: boolean, fondo?: string) => {
        const y = doc.y;
        let x = x0;
        const alturas = celdas.map((c, i) => doc.heightOfString(c, { width: anchos[i] - 8 }));
        const alto = Math.max(...alturas) + 8;
        if (y + alto > doc.page.height - 80) { doc.addPage(); return fila(celdas, negrita, fondo); }
        if (fondo) doc.rect(x0, y, ancho, alto).fill(fondo);
        celdas.forEach((c, i) => {
          doc.font(negrita ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(negrita ? '#ffffff' : TINTA).text(c, x + 4, y + 4, { width: anchos[i] - 8, align: i === 0 ? 'left' : 'right' });
          x += anchos[i];
        });
        doc.y = y + alto;
      };
      fila(columnas, true, AZUL);
      filas.forEach((f, i) => fila(f, false, i % 2 ? '#f4f9fe' : undefined));
    }

    if (d.totales?.length) {
      doc.moveDown(0.8);
      for (const [k, v] of d.totales) {
        const y = doc.y;
        const fuerte = k === d.totales[d.totales.length - 1][0];
        doc.font(fuerte ? 'Helvetica-Bold' : 'Helvetica').fontSize(fuerte ? 12 : 10).fillColor(TINTA);
        doc.text(k, 48, y, { width: ancho - 120, align: 'right' });
        doc.text(v, 48 + ancho - 110, y, { width: 110, align: 'right' });
        doc.y = y + (fuerte ? 18 : 14);
      }
    }

    for (const t of d.textos ?? []) {
      if (!t.texto.trim()) continue;
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(TINTA).text(t.titulo, 48, doc.y, { width: ancho });
      doc.font('Helvetica').fontSize(10).fillColor(TINTA).text(t.texto, { width: ancho });
    }

    if (d.pie) doc.font('Helvetica').fontSize(8).fillColor(GRIS).text(d.pie, 48, doc.page.height - 60, { width: ancho, align: 'center' });
    doc.end();
  });
}

/** Encabezado de los documentos: nombre de la marca + datos de «Ajustes del sitio» (CMS) si existen. */
export async function empresaPdf(prisma: PrismaService, marcaId: string): Promise<EmpresaPdf> {
  const [marca, fila] = await Promise.all([
    prisma.marca.findFirst({ where: { id: marcaId }, select: { nombre: true } }),
    prisma.contenidoWeb.findFirst({ where: { marcaId, pagina: 'sitio', seccion: 'contacto' } }),
  ]);
  const c = (fila?.datos ?? {}) as { direccion?: string; telefonoVentas?: string; correo?: string };
  return {
    nombre: marca?.nombre ?? 'FPTecnologi & System',
    direccion: c.direccion ?? '',
    contacto: [c.telefonoVentas, c.correo].filter(Boolean).join(' · '),
  };
}

export const fechaPdf = (d: Date | string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
export const dineroPdf = (n: unknown, moneda = 'USD') => `${moneda === 'USD' ? 'US$' : moneda} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Cotización de un servicio (propuesta del equipo) como PDF; la usan el correo al cliente y la descarga desde Mi cuenta. */
export function pdfCotizacion(
  empresa: EmpresaPdf,
  c: { numero: string | null; id: string; clienteNombre: string; clienteEmail: string; mensaje: string | null; propuesta: string | null; monto: unknown; moneda: string; validezHasta: Date | null; enviadaAt: Date | null; createdAt: Date; servicio: { nombre: string } },
): Promise<Buffer> {
  const numero = c.numero ?? c.id.slice(0, 8);
  return generarPdf({
    empresa,
    tipo: 'Cotización',
    numero,
    meta: [
      ['Servicio', c.servicio.nombre],
      ['Cliente', c.clienteNombre],
      ['Correo', c.clienteEmail],
      ['Solicitada el', fechaPdf(c.createdAt)],
      ['Enviada el', fechaPdf(c.enviadaAt)],
      ['Válida hasta', fechaPdf(c.validezHasta)],
      ['Inversión', c.monto != null ? dineroPdf(c.monto, c.moneda) : ''],
    ].filter(([, v]) => v) as [string, string][],
    textos: [
      { titulo: 'Lo que solicitaste', texto: c.mensaje ?? '' },
      { titulo: 'Propuesta', texto: c.propuesta ?? '' },
    ],
    pie: 'Documento sujeto a la validez indicada.',
  });
}
