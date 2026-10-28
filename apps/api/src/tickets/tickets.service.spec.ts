import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { TicketsRolGuard } from './tickets-rol.guard.js';
import { rolesTickets } from './tickets.roles.js';

function setup(marca: Record<string, unknown>) {
  const prisma = {
    marca: { findUnique: vi.fn(async () => marca) },
    ticket: { create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 't1', ...data })) },
    usuarioMarcaRol: { findMany: vi.fn(async () => [{ usuario: { id: 'u1', email: 'admin@quamtu.com', activo: true } }]) },
    notificacion: { createMany: vi.fn(async () => ({ count: 1 })) },
  };
  const mail = { sendAviso: vi.fn(async () => undefined), sendLeadNuevo: vi.fn(async () => undefined) };
  return { prisma, mail, service: new TicketsService(prisma as never, mail as never) };
}

const DTO = { tipo: 'SOPORTE', nombre: 'Ana', email: 'Ana@Correo.com', descripcion: 'La PC no enciende' } as never;
const QUAMTU = { nombre: 'Quamtu', colorPrimario: '#0B7A75', correoTickets: 'soporte@quamtu.com', contactoEmail: 'hola@quamtu.com', sitios: [{ dominio: 'quamtu.com' }] };

describe('tickets por marca', () => {
  it('roles: Quamtu y Kelqa solo admin; el resto admin y comercial', () => {
    expect(rolesTickets('Quamtu')).toEqual(['admin']);
    expect(rolesTickets('KELQA')).toEqual(['admin']);
    expect(rolesTickets('FPTecnologi')).toEqual(['admin', 'comercial', 'soporte']);
  });

  it('ticket nuevo: avisa al buzón designado y solo a los roles de esa marca; el cliente recibe la web y el nombre de su marca', async () => {
    const { prisma, mail, service } = setup(QUAMTU);
    await service.crearPublico('mq', DTO);
    await new Promise((r) => setTimeout(r, 0));
    const where = (prisma.usuarioMarcaRol.findMany.mock.calls[0] as unknown as [{ where: { marcaId: string; rol: { nombre: { in: string[] } } } }])[0].where;
    expect(where).toEqual({ marcaId: 'mq', rol: { nombre: { in: ['admin'] } } });
    const avisos = mail.sendAviso.mock.calls as unknown as [string, { boton: { url: string }; marca: { nombre: string }; parrafos: string[] }][];
    const buzon = avisos.find(([to]) => to === 'soporte@quamtu.com');
    expect(buzon?.[1].parrafos.join(' ')).toContain('La PC no enciende');
    const cliente = avisos.find(([to]) => to === 'ana@correo.com');
    expect(cliente?.[1].boton.url).toMatch(/^https:\/\/quamtu\.com\/tickets\/seguimiento\?n=TCK-/);
    expect(cliente?.[1].marca.nombre).toBe('Quamtu');
    expect(avisos.find(([to]) => to === 'admin@quamtu.com')?.[1].parrafos.join(' ')).toContain('La PC no enciende');
  });

  it('sin correo de tickets usa el de contacto; sin dominio usa la web conocida de la marca', async () => {
    const { service } = setup({ ...QUAMTU, correoTickets: null, sitios: [] });
    const m = await service.marcaTickets('mq');
    expect(m).toMatchObject({ correo: 'hola@quamtu.com', web: 'https://quamtu.com' });
  });

  it('guard: un comercial de Quamtu no entra; un comercial de FPTecnologi sí', async () => {
    const ctx = (rol: string) => ({ switchToHttp: () => ({ getRequest: () => ({ headers: { 'x-marca-id': 'm1' }, query: {}, user: { marcas: [{ marcaId: 'm1', rol }] } }) }) }) as never;
    const guard = (nombre: string) => new TicketsRolGuard({ marca: { findUnique: vi.fn(async () => ({ nombre })) } } as never);
    await expect(guard('Quamtu').canActivate(ctx('comercial'))).rejects.toBeInstanceOf(ForbiddenException);
    await expect(guard('Quamtu').canActivate(ctx('admin'))).resolves.toBe(true);
    await expect(guard('FPTecnologi').canActivate(ctx('comercial'))).resolves.toBe(true);
  });
});
