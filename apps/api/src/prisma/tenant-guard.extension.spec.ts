import { describe, expect, it } from 'vitest';
import { hasMarcaId, hasKey, tenantGuardExtension } from './tenant-guard.extension.js';
import { PrismaClient } from '../generated/prisma/client.js';

describe('hasMarcaId', () => {
  it('finds a top-level marcaId', () => {
    expect(hasMarcaId({ marcaId: 'm1', activo: true })).toBe(true);
  });

  it('finds marcaId inside a compound unique key (one level of nesting)', () => {
    expect(hasMarcaId({ marcaId_sku: { marcaId: 'm1', sku: 'ABC' } })).toBe(true);
  });

  it('finds marcaId inside AND/OR arrays', () => {
    expect(hasMarcaId({ AND: [{ activo: true }, { marcaId: 'm1' }] })).toBe(true);
    expect(hasMarcaId({ OR: [{ marcaId: 'm1' }, { marcaId: 'm2' }] })).toBe(true);
  });

  it('returns false when marcaId is missing entirely', () => {
    expect(hasMarcaId({ id: '1', activo: true })).toBe(false);
    expect(hasMarcaId({ AND: [{ activo: true }, { id: '1' }] })).toBe(false);
  });

  it('returns false for null/undefined/non-object input', () => {
    expect(hasMarcaId(undefined)).toBe(false);
    expect(hasMarcaId(null)).toBe(false);
    expect(hasMarcaId('marcaId')).toBe(false);
  });

  it('does not recurse past the depth that real query shapes need', () => {
    expect(hasMarcaId({ AND: [{ OR: [{ marcaId: 'm1' }] }] })).toBe(false);
  });
});

describe('hasKey', () => {
  it('finds usuarioId — the UsuarioMarcaRol cross-marca allowance ("my own marcas") relies on this', () => {
    expect(hasKey({ usuarioId: 'u1' }, 'usuarioId')).toBe(true);
  });

  it('returns false when the target key is absent', () => {
    expect(hasKey({ marcaId: 'm1' }, 'usuarioId')).toBe(false);
  });
});

describe('marcaId vacío', () => {
  // El candado corta antes de abrir la conexión: la dirección no existe a propósito.
  const db = new PrismaClient({ datasourceUrl: 'postgresql://nadie@127.0.0.1:1/nada' }).$extends(tenantGuardExtension);
  const marcaId = undefined as unknown as string;

  it('no cuenta como filtro', () => {
    expect(hasMarcaId({ marcaId: undefined })).toBe(false);
    expect(hasMarcaId({ marcaId_slug: { marcaId: undefined, slug: 'x' } })).toBe(false);
    expect(hasMarcaId({ marcaId: null })).toBe(true);
  });

  it('una consulta o un alta sin marca responde 400 en vez de salir para todas', async () => {
    await expect(db.chatAsesor.findMany({ where: { marcaId, activo: true } })).rejects.toMatchObject({ status: 400 });
    await expect(db.chatAsesor.create({ data: { marcaId, nombre: 'a', area: 'b', telefono: '1', whatsapp: '2' } })).rejects.toMatchObject({ status: 400 });
  });

  it('olvidar el filtro en el código sigue fallando como error interno', async () => {
    await expect(db.chatAsesor.findMany({ where: { activo: true } })).rejects.toThrow('tenant-guard');
  });
});
