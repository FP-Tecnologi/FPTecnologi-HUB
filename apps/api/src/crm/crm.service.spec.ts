import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { CrmService } from './crm.service.js';

/** Prisma falso en memoria, lo justo para el CRM. */
function prismaFalso() {
  const db = { empresas: [] as Record<string, unknown>[], contactos: [] as Record<string, unknown>[], opps: [] as Record<string, unknown>[], acts: [] as Record<string, unknown>[] };
  let id = 0;
  const nuevo = (arr: Record<string, unknown>[], data: Record<string, unknown>) => { const r = { id: `id${++id}`, createdAt: new Date(), updatedAt: new Date(), ...data }; arr.push(r); return r; };
  const coincide = (r: Record<string, unknown>, where: Record<string, unknown>) =>
    Object.entries(where).every(([k, v]) => {
      if (v && typeof v === 'object' && 'in' in (v as object)) return ((v as { in: unknown[] }).in).includes(r[k]);
      if (v && typeof v === 'object' && 'equals' in (v as object)) return String(r[k]).toLowerCase() === String((v as { equals: string }).equals).toLowerCase();
      return r[k] === v;
    });
  const prisma = {
    db,
    crmEmpresa: { findFirst: vi.fn(async ({ where }) => db.empresas.find((r) => coincide(r, where)) ?? null), create: vi.fn(async ({ data }) => nuevo(db.empresas, data)) },
    crmContacto: {
      findFirst: vi.fn(async ({ where }) => db.contactos.find((r) => coincide(r, where)) ?? null),
      create: vi.fn(async ({ data }) => nuevo(db.contactos, data)),
      update: vi.fn(async ({ where, data }) => Object.assign(db.contactos.find((r) => r.id === where.id)!, data)),
    },
    crmOportunidad: {
      findFirst: vi.fn(async ({ where }) => { const r = db.opps.find((x) => coincide(x, where)); return r ? { ...r } : null; }),
      create: vi.fn(async ({ data }) => nuevo(db.opps, { etapa: 'NUEVO', ...data })),
      update: vi.fn(async ({ where, data }) => Object.assign(db.opps.find((r) => r.id === where.id)!, data)),
      findMany: vi.fn(async () => []),
    },
    crmActividad: { create: vi.fn(async ({ data }) => nuevo(db.acts, data)) },
    usuarioMarcaRol: { findMany: vi.fn(async () => []) },
  };
  return prisma;
}

const lead = (origenId: string, email = 'ana@acme.pe') => ({
  origen: 'COTIZADOR' as const, origenId, nombre: 'Ana Pérez', email, celular: '987654321', ruc: '20123456789', empresa: 'Acme SAC', titulo: 'Laptops para oficina', detalle: '10 equipos',
});

describe('CrmService.registrarSolicitud', () => {
  it('primera solicitud: crea empresa, contacto y oportunidad en Nuevo, enlazada al origen', async () => {
    const prisma = prismaFalso();
    const r = await new CrmService(prisma as never).registrarSolicitud('m1', lead('L1'));
    expect(r).toMatchObject({ nueva: true });
    expect(prisma.db.empresas).toHaveLength(1);
    expect(prisma.db.contactos).toHaveLength(1);
    expect(prisma.db.opps[0]).toMatchObject({ marcaId: 'm1', origen: 'COTIZADOR', origenId: 'L1', titulo: 'Laptops para oficina' });
    expect(prisma.db.acts[0]).toMatchObject({ tipo: 'SOLICITUD', origen: 'COTIZADOR', origenId: 'L1' });
  });

  it('mismo cliente con una oportunidad abierta: no duplica, suma la solicitud a su historial', async () => {
    const prisma = prismaFalso();
    const crm = new CrmService(prisma as never);
    const a = await crm.registrarSolicitud('m1', lead('L1'));
    const b = await crm.registrarSolicitud('m1', { ...lead('C9', 'ANA@acme.pe'), origen: 'COTIZACION' });
    expect(b).toEqual({ oportunidadId: a!.oportunidadId, nueva: false });
    expect(prisma.db.opps).toHaveLength(1);
    expect(prisma.db.contactos).toHaveLength(1);
    expect(prisma.db.empresas).toHaveLength(1);
    expect(prisma.db.acts.map((x) => x.origenId)).toEqual(['L1', 'C9']);
  });

  it('si la oportunidad anterior ya se cerró, abre una nueva para el mismo contacto', async () => {
    const prisma = prismaFalso();
    const crm = new CrmService(prisma as never);
    await crm.registrarSolicitud('m1', lead('L1'));
    prisma.db.opps[0]!.etapa = 'GANADO';
    const r = await crm.registrarSolicitud('m1', lead('L2'));
    expect(r?.nueva).toBe(true);
    expect(prisma.db.opps).toHaveLength(2);
    expect(prisma.db.contactos).toHaveLength(1);
  });

  it('otra marca no comparte contactos', async () => {
    const prisma = prismaFalso();
    const crm = new CrmService(prisma as never);
    await crm.registrarSolicitud('m1', lead('L1'));
    await crm.registrarSolicitud('m2', lead('L2'));
    expect(prisma.db.contactos.map((c) => c.marcaId)).toEqual(['m1', 'm2']);
    expect(prisma.db.opps).toHaveLength(2);
  });

  it('nunca lanza: un error de base devuelve null', async () => {
    const prisma = prismaFalso();
    prisma.crmContacto.findFirst.mockRejectedValueOnce(new Error('caída'));
    await expect(new CrmService(prisma as never).registrarSolicitud('m1', lead('L1'))).resolves.toBeNull();
  });
});

describe('CrmService.cambiarEtapa', () => {
  it('perdido exige motivo', async () => {
    const prisma = prismaFalso();
    prisma.db.opps.push({ id: 'o1', marcaId: 'm1', etapa: 'PROPUESTA' });
    await expect(new CrmService(prisma as never).cambiarEtapa('m1', 'o1', { etapa: 'PERDIDO' }, 'a@b')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('ganado fija las fechas de cierre y deja la actividad de etapa', async () => {
    const prisma = prismaFalso();
    prisma.db.opps.push({ id: 'o1', marcaId: 'm1', etapa: 'NEGOCIACION', origen: 'MANUAL', origenId: null });
    const crm = new CrmService(prisma as never);
    vi.spyOn(crm, 'obtener').mockResolvedValue({} as never);
    await crm.cambiarEtapa('m1', 'o1', { etapa: 'GANADO' }, 'a@b');
    expect(prisma.db.opps[0]).toMatchObject({ etapa: 'GANADO', motivoPerdida: null });
    expect(prisma.db.opps[0]!.ganadoAt).toBeInstanceOf(Date);
    expect(prisma.db.acts[0]).toMatchObject({ tipo: 'ETAPA', texto: 'Negociación → Ganado', autor: 'a@b' });
  });
});

describe('CrmService.crear', () => {
  it('RUC y correo ya registrados: reutiliza el cliente y le abre otra oportunidad', async () => {
    const prisma = prismaFalso();
    prisma.db.empresas.push({ id: 'e1', marcaId: 'm1', ruc: '20123456789', razonSocial: 'Acme SAC' });
    prisma.db.contactos.push({ id: 'c1', marcaId: 'm1', email: 'ana@acme.pe', nombre: 'Ana' });
    prisma.db.opps.push({ id: 'o0', marcaId: 'm1', empresaId: 'e1', contactoId: 'c1', etapa: 'PROPUESTA' });
    const crm = new CrmService(prisma as never);
    vi.spyOn(crm, 'obtener').mockResolvedValue({} as never);
    await crm.crear('m1', { titulo: 'Proyectores', empresaNueva: { ruc: '20123456789' }, contactoNuevo: { nombre: 'Ana', email: 'ANA@acme.pe' } } as never, 'a@b');
    expect(prisma.db.empresas).toHaveLength(1);
    expect(prisma.db.contactos).toHaveLength(1);
    expect(prisma.db.opps.at(-1)).toMatchObject({ empresaId: 'e1', contactoId: 'c1', titulo: 'Proyectores' });
  });
});
