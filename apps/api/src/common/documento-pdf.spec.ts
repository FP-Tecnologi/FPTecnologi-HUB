import { describe, expect, it } from 'vitest';
import { generarPdf, pdfCotizacion } from './documento-pdf.js';

const empresa = { nombre: 'FPTecnologi & System', direccion: 'Jr. Huaraz 1841, Breña', contacto: '+51 970 614 881' };

describe('documento-pdf', () => {
  it('genera un PDF válido con tabla larga (varias páginas) y caracteres en español', async () => {
    const filas = Array.from({ length: 80 }, (_, i) => [`Monitor ñandú ${i}\nSKU X${i}`, '6', 'US$ 200.00', 'US$ 1,200.00']);
    const pdf = await generarPdf({
      empresa,
      tipo: 'Presupuesto',
      numero: 'COT-2026-ABC123',
      meta: [['Cliente', 'Ana Pérez']],
      tabla: { columnas: ['Producto', 'Cant.', 'P. unit.', 'Subtotal'], anchos: [255, 50, 95, 95], filas },
      totales: [['Subtotal', 'US$ 1.00'], ['Total', 'US$ 1.18']],
    });
    expect(pdf.toString('ascii', 0, 5)).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(2000);
  });

  it('cotización sin monto ni validez también sale', async () => {
    const pdf = await pdfCotizacion(empresa, {
      numero: null, id: 'abcdef12-0000', clienteNombre: 'Ana', clienteEmail: 'a@x.com', mensaje: 'Necesito cámaras', propuesta: 'Instalación de 8 cámaras',
      monto: null, moneda: 'USD', validezHasta: null, enviadaAt: null, createdAt: new Date(), servicio: { nombre: 'Seguridad ciudadana' },
    });
    expect(pdf.toString('ascii', 0, 5)).toBe('%PDF-');
  });
});
