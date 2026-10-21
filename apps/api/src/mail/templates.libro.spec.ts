import { describe, expect, it } from 'vitest';
import { hojaConsumidorEmail, respuestaReclamoEmail, type HojaCorreo } from './templates.js';

const hoja: HojaCorreo = {
  codigo: 'LR-0001-2026',
  fecha: new Date('2026-10-19T12:00:00'),
  fechaLimite: new Date('2026-11-09T12:00:00'),
  proveedor: { razonSocial: 'Fimav SAC', ruc: '20123456789', nombreComercial: 'Fimav', direccion: 'Lima' },
  consumidor: { nombres: '<script>alert(1)</script>', apellidos: 'Pérez', tipoDocumento: 'DNI', nroDocumento: '12345678', domicilio: 'Av. 1', telefono: '999', email: 'a@b.pe' },
  menorEdad: false,
  bien: { tipo: 'PRODUCTO', monto: '10.5', moneda: 'PEN', descripcion: 'Router', nroPedido: null },
  tipo: 'RECLAMO',
  detalle: '<script>x</script>',
  pedido: 'Reembolso',
  medioRespuesta: 'CORREO',
};

describe('hojaConsumidorEmail', () => {
  it('escapa HTML y menciona código y 15 días hábiles', () => {
    const { html } = hojaConsumidorEmail(hoja);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('LR-0001-2026');
    expect(html).toContain('15 días hábiles');
    expect(html).toContain('no impide acudir a Indecopi');
    expect(html).toContain('Correo electrónico');
    expect(html).toContain('Reclamo');
    expect(html).toContain('Producto');
    expect(html).toContain('PEN 10.50');
    expect(html).not.toContain('>CORREO<');
  });
});

describe('respuestaReclamoEmail', () => {
  it('escapa la respuesta', () => {
    const { html } = respuestaReclamoEmail({ codigo: 'LR-1', tipo: 'RECLAMO', respuesta: '<b>x</b>', proveedor: hoja.proveedor });
    expect(html).not.toContain('<b>x</b>');
  });
});
