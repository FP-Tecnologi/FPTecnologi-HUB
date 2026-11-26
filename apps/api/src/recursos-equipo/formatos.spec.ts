import { describe, expect, it } from 'vitest';
import { validarFormato } from './formatos.js';
import { parsearEtiquetas } from './recursos-equipo.service.js';

const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]);

describe('validarFormato', () => {
  it('acepta un PNG real y un SVG limpio', () => {
    expect(validarFormato('logo.png', png)).toEqual({ ext: 'png', mime: 'image/png' });
    expect(validarFormato('logo.SVG', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')).ext).toBe('svg');
  });
  it('rechaza una extensión que no coincide con los bytes', () => {
    expect(() => validarFormato('logo.jpg', png)).toThrow();
    expect(() => validarFormato('doc.pdf', Buffer.from('hola mundo'))).toThrow();
  });
  it('rechaza SVG con scripts y ejecutables', () => {
    expect(() => validarFormato('x.svg', Buffer.from('<svg><script>alert(1)</script></svg>'))).toThrow();
    expect(() => validarFormato('x.svg', Buffer.from('<svg onload="x()"></svg>'))).toThrow();
    expect(() => validarFormato('virus.exe', Buffer.from('MZ'))).toThrow();
    expect(() => validarFormato('sinextension', Buffer.from('x'))).toThrow();
  });
  it('acepta plantillas de correo en HTML y rechaza binarios disfrazados', () => {
    expect(validarFormato('plantilla.html', Buffer.from('<html></html>')).mime).toBe('text/html');
    expect(() => validarFormato('plantilla.html', Buffer.from([0x3c, 0x00, 0x01]))).toThrow();
  });
});

describe('parsearEtiquetas', () => {
  it('limpia, pasa a minúsculas y quita repetidas', () => {
    expect(parsearEtiquetas(' Logo, logo ,,Color ')).toEqual(['logo', 'color']);
    expect(parsearEtiquetas(undefined)).toEqual([]);
  });
});
