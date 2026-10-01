import { describe, expect, it } from 'vitest';
import { enlaceSeguro, faltaParaActivar, limpiarContenido, limpiarPaginas, PLANTILLAS, situacion, vigente } from './popups.modelo.js';

describe('popups.modelo', () => {
  it('enlaceSeguro solo deja https, http y rutas internas', () => {
    expect(enlaceSeguro('https://fptecnologi.com/x')).toBe('https://fptecnologi.com/x');
    expect(enlaceSeguro('/tienda')).toBe('/tienda');
    expect(enlaceSeguro('javascript:alert(1)')).toBe('');
    expect(enlaceSeguro('data:text/html,hola')).toBe('');
    expect(enlaceSeguro('//evil.com')).toBe('');
  });

  it('limpiarContenido descarta claves desconocidas y recorta largos', () => {
    const c = limpiarContenido({ titulo: 'x'.repeat(500), hack: '<script>', accion: 'otra', url: 'javascript:1', tema: 'rojo' }, 'promocion');
    expect(c.titulo).toHaveLength(90);
    expect(c).not.toHaveProperty('hack');
    expect(c.accion).toBe('ninguna');
    expect(c.url).toBe('');
    expect(c.tema).toBe('azul');
  });

  it('limpiarPaginas filtra claves inválidas y "todas" gana', () => {
    expect(limpiarPaginas(['home', 'nada', 'home', 'tienda'])).toEqual(['home', 'tienda']);
    expect(limpiarPaginas(['home', 'todas'])).toEqual(['todas']);
  });

  it('vigente respeta inicio y fin', () => {
    const ahora = new Date('2026-10-10T12:00:00Z');
    expect(vigente({ inicio: null, fin: null }, ahora)).toBe(true);
    expect(vigente({ inicio: new Date('2026-10-11T00:00:00Z'), fin: null }, ahora)).toBe(false);
    expect(vigente({ inicio: null, fin: new Date('2026-10-09T00:00:00Z') }, ahora)).toBe(false);
  });

  it('situacion combina estado y fechas', () => {
    const ahora = new Date('2026-10-10T12:00:00Z');
    expect(situacion({ estado: 'BORRADOR', inicio: null, fin: null }, ahora)).toBe('borrador');
    expect(situacion({ estado: 'ACTIVO', inicio: new Date('2026-11-01'), fin: null }, ahora)).toBe('programado');
    expect(situacion({ estado: 'ACTIVO', inicio: null, fin: new Date('2026-10-01') }, ahora)).toBe('finalizado');
    expect(situacion({ estado: 'ACTIVO', inicio: null, fin: null }, ahora)).toBe('en_curso');
  });

  it('faltaParaActivar exige página, título y producto cuando corresponde', () => {
    const def = PLANTILLAS.find((p) => p.id === 'promocion')!.contenido;
    expect(faltaParaActivar({ plantilla: 'promocion', contenido: def, productoId: null, paginas: [] })).toMatch(/página/);
    expect(faltaParaActivar({ plantilla: 'promocion', contenido: { ...def, titulo: '' }, productoId: null, paginas: ['home'] })).toMatch(/título/);
    const prod = PLANTILLAS.find((p) => p.id === 'producto')!.contenido;
    expect(faltaParaActivar({ plantilla: 'producto', contenido: prod, productoId: null, paginas: ['home'] })).toMatch(/producto/);
    expect(faltaParaActivar({ plantilla: 'promocion', contenido: def, productoId: null, paginas: ['home'] })).toBeNull();
  });
});
