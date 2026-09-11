import { describe, expect, it } from 'vitest';
import { hasMarcaId } from './tenant-guard.extension.js';

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
