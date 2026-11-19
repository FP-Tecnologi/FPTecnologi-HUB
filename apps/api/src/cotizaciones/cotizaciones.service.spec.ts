import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service.js';

const base = {
  id: 'c1', numero: 'COT-2026-ABC123', estado: 'PENDIENTE', clienteNombre: 'Ana', clienteEmail: 'ana@x.com', clienteTelefono: '987654321',
  propuesta: 'Instalación de 8 cámaras', monto: 1200, moneda: 'USD', validezHasta: null, servicio: { id: 's1', nombre: 'Seguridad ciudadana' }, envios: [],
};

function setup(cot: Record<string, unknown> = base) {
  const prisma = {
    cotizacion: { findFirst: vi.fn(async () => cot), updateMany: vi.fn(async (_a: { data: Record<string, unknown> }) => ({ count: 1 })) },
    cotizacionEnvio: { create: vi.fn(async (_a: unknown) => ({})) },
    marca: { findFirst: vi.fn(async () => ({ nombre: 'FPTecnologi' })) },
    contenidoWeb: { findFirst: vi.fn(async () => null) },
  };
  const mail = { sendCotizacionServicio: vi.fn(async () => {}) };
  return { service: new CotizacionesService(prisma as never, mail as never, { registrarSolicitud: vi.fn(async () => null) } as never), prisma, mail };
}

describe('CotizacionesService.enviar', () => {
  it('no envía una cotización sin propuesta ni monto', async () => {
    const { service, mail } = setup({ ...base, propuesta: null, monto: null });
    await expect(service.enviar('m1', 'c1', { canal: 'EMAIL' }, 'a@fp.com')).rejects.toThrow('propuesta');
    expect(mail.sendCotizacionServicio).not.toHaveBeenCalled();
  });

  it('por correo: envía, registra el envío y la pasa a ENVIADA', async () => {
    const { service, prisma, mail } = setup();
    const r = await service.enviar('m1', 'c1', { canal: 'EMAIL' }, 'a@fp.com');
    expect(mail.sendCotizacionServicio).toHaveBeenCalledWith('ana@x.com', expect.objectContaining({ numero: 'COT-2026-ABC123', monto: 'USD 1,200.00' }), [expect.objectContaining({ filename: 'cotizacion-COT-2026-ABC123.pdf' })], expect.anything());
    expect(prisma.cotizacionEnvio.create).toHaveBeenCalledWith({ data: expect.objectContaining({ marcaId: 'm1', canal: 'EMAIL', destinatario: 'ana@x.com', enviadoPor: 'a@fp.com' }) });
    expect(prisma.cotizacion.updateMany.mock.calls[0][0].data.estado).toBe('ENVIADA');
    expect(r.url).toBeNull();
  });

  it('si el correo falla no registra el envío', async () => {
    const { service, prisma, mail } = setup();
    mail.sendCotizacionServicio.mockRejectedValueOnce(new Error('smtp'));
    await expect(service.enviar('m1', 'c1', { canal: 'EMAIL' }, 'a@fp.com')).rejects.toThrow('correo');
    expect(prisma.cotizacionEnvio.create).not.toHaveBeenCalled();
  });

  it('por WhatsApp: devuelve el enlace wa.me con el mensaje y no cambia un estado ya avanzado', async () => {
    const { service, prisma } = setup({ ...base, estado: 'ACEPTADA' });
    const r = await service.enviar('m1', 'c1', { canal: 'WHATSAPP' }, 'a@fp.com');
    expect(r.url).toMatch(/^https:\/\/wa\.me\/51987654321\?text=/);
    expect(decodeURIComponent(r.url!)).toContain('Seguridad ciudadana');
    expect(prisma.cotizacion.updateMany.mock.calls[0][0].data.estado).toBeUndefined();
  });

  it('por WhatsApp exige celular', async () => {
    const { service } = setup({ ...base, clienteTelefono: null });
    await expect(service.enviar('m1', 'c1', { canal: 'WHATSAPP' }, 'a@fp.com')).rejects.toThrow('celular');
  });
});

describe('CotizacionesService.crearDesdeCrm', () => {
  const op = { id: 'o1', numero: 'OPP-1', titulo: 'Laptops', contacto: { nombre: 'Ana', email: 'ANA@acme.pe', celular: '987654321' }, empresa: { razonSocial: 'Acme' } };
  const armar = (opp: unknown, servicio: unknown = { id: 's1', nombre: 'Soporte' }) => {
    const prisma = {
      crmOportunidad: { findFirst: vi.fn(async () => opp) },
      servicio: { findFirst: vi.fn(async () => servicio) },
      cotizacion: { create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'c1', numero: data.numero })), findFirst: vi.fn(async () => ({ id: 'c1', numero: 'COT', servicio: {}, envios: [] })) },
    };
    const crm = { agregarActividad: vi.fn(async () => ({})) };
    return { prisma, crm, svc: new CotizacionesService(prisma as never, {} as never, crm as never) };
  };
  const dto = { oportunidadId: 'o1', servicioId: 's1', monto: 1500, moneda: 'PEN' as const };

  it('toma el cliente del contacto de la oportunidad, la anota en el historial y no la envía si no se pide', async () => {
    const { svc, prisma, crm } = armar(op);
    const r = await svc.crearDesdeCrm('m1', dto, 'v@x.pe', { usuarioId: 'u1', veTodo: true });
    expect(prisma.cotizacion.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ clienteEmail: 'ana@acme.pe', clienteNombre: 'Ana', marcaId: 'm1', estado: 'EN_REVISION' }) }));
    expect(crm.agregarActividad).toHaveBeenCalledWith('m1', 'o1', expect.objectContaining({ tipo: 'NOTA' }), 'v@x.pe', expect.anything());
    expect(r.envio).toBeNull();
  });

  it('un comercial solo cotiza oportunidades que tiene asignadas', async () => {
    const { svc, prisma } = armar(op);
    await svc.crearDesdeCrm('m1', dto, 'v@x.pe', { usuarioId: 'u1', veTodo: false });
    expect(prisma.crmOportunidad.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ asignadoId: 'u1' }) }));
  });

  it('sin contacto con correo no cotiza', async () => {
    const { svc } = armar({ ...op, contacto: { nombre: 'Ana', email: null } });
    await expect(svc.crearDesdeCrm('m1', dto, 'v@x.pe', { usuarioId: 'u1', veTodo: true })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('una oportunidad ajena responde "no encontrada"', async () => {
    const { svc } = armar(null);
    await expect(svc.crearDesdeCrm('m1', dto, 'v@x.pe', { usuarioId: 'u1', veTodo: true })).rejects.toBeInstanceOf(NotFoundException);
  });
});
