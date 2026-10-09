import { describe, expect, it, vi } from 'vitest';
import { limpiarEnlaces, limpiarUrl, slugDe, vcard } from './tarjetas.modelo.js';
import { TarjetasService } from './tarjetas.service.js';

describe('tarjetas.modelo', () => {
  it('slug sin tildes ni símbolos', () => {
    expect(slugDe('María José Pérez-Núñez!')).toBe('maria-jose-perez-nunez');
    expect(slugDe('  ¡¡  ')).toBe('');
  });

  it('solo acepta enlaces https/http (y /uploads si se permite)', () => {
    expect(limpiarUrl('https://linkedin.com/in/ana')).toBe('https://linkedin.com/in/ana');
    expect(limpiarUrl('javascript:alert(1)')).toBeUndefined();
    expect(limpiarUrl('data:text/html,<script>')).toBeUndefined();
    expect(limpiarUrl('')).toBeNull();
    expect(limpiarUrl('/uploads/m/a.png')).toBeUndefined();
    expect(limpiarUrl('/uploads/m/a.png', true)).toBe('/uploads/m/a.png');
  });

  it('enlaces extra: títulos y urls válidos, máximo 8, ignora filas vacías', () => {
    expect(limpiarEnlaces([{ titulo: 'Catálogo', url: 'https://x.com/c' }, { titulo: '', url: '' }])).toEqual([{ titulo: 'Catálogo', url: 'https://x.com/c' }]);
    expect(limpiarEnlaces([{ titulo: 'Mal', url: 'javascript:1' }])).toBeUndefined();
    expect(limpiarEnlaces(Array.from({ length: 9 }, () => ({ titulo: 'a', url: 'https://a.com' })))).toBeUndefined();
  });

  it('vCard 3.0 con nombre, cargo, teléfonos y escapes', () => {
    const v = vcard({ nombre: 'Ana María Pérez', cargo: 'Ejecutiva; Ventas', empresa: 'FPTecnologi & System', telefono: '+51 970 614 881', whatsapp: '51970614881', email: 'ana@fptecnologi.com', urlTarjeta: 'https://fptecnologi.com/tarjeta/ana' });
    expect(v).toContain('BEGIN:VCARD');
    expect(v).toContain('FN:Ana María Pérez');
    expect(v).toContain('N:Pérez;Ana María;;;');
    expect(v).toContain('TITLE:Ejecutiva\\; Ventas');
    expect(v).toContain('TEL;TYPE=CELL:+51970614881');
    expect(v.endsWith('END:VCARD\r\n')).toBe(true);
  });
});

function setup(over: Record<string, unknown> = {}) {
  const prisma = {
    tarjetaDigital: {
      findFirst: vi.fn(async (_a: unknown) => null as unknown),
      create: vi.fn(async (_a: unknown) => ({})),
      updateMany: vi.fn(async (_a: unknown) => ({ count: 1 })),
    },
    usuario: { findFirst: vi.fn(async () => ({ nombre: 'Ana Pérez', email: 'ana@x.com', cargo: null, telefono: null })) },
    marca: { findFirst: vi.fn(async () => ({ nombre: 'FPTecnologi' })) },
    ...over,
  };
  return { service: new TarjetasService(prisma as never), prisma };
}

describe('TarjetasService', () => {
  it('crea la tarjeta con slug del nombre y limpia teléfonos', async () => {
    const { service, prisma } = setup();
    await service.guardarMia('m1', 'u1', { nombre: 'Ana Pérez', whatsapp: '+51 970-614-881', linkedin: 'https://linkedin.com/in/ana' });
    const data = (prisma.tarjetaDigital.create.mock.calls[0][0] as { data: Record<string, unknown> }).data;
    expect(data).toMatchObject({ marcaId: 'm1', usuarioId: 'u1', slug: 'ana-perez', whatsapp: '51970614881', activo: true });
  });

  it('rechaza un enlace (slug) que ya usa otra persona', async () => {
    const { service, prisma } = setup();
    prisma.tarjetaDigital.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'otra' });
    await expect(service.guardarMia('m1', 'u1', { nombre: 'Ana Pérez' })).rejects.toThrow('ya lo usa');
  });

  it('rechaza urls peligrosas y correos inválidos', async () => {
    const { service } = setup();
    await expect(service.guardarMia('m1', 'u1', { nombre: 'Ana Pérez', web: 'javascript:alert(1)' })).rejects.toThrow('https://');
    await expect(service.guardarMia('m1', 'u1', { nombre: 'Ana Pérez', email: 'no-es-correo' })).rejects.toThrow('correo');
  });

  it('la tarjeta pública solo sale si está activa, siempre dentro de la marca', async () => {
    const { service, prisma } = setup();
    await expect(service.ver('m1', 'ana')).rejects.toThrow('no encontrada');
    const where = (prisma.tarjetaDigital.findFirst.mock.calls[0][0] as { where: Record<string, unknown> }).where;
    expect(where).toMatchObject({ marcaId: 'm1', slug: 'ana', activo: true });
  });
});
