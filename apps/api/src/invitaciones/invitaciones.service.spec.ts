import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvitacionesService } from './invitaciones.service.js';

const vigente = {
  id: 'i1', marcaId: 'm1', rolId: 'r1', email: 'a@b.com', aceptadaAt: null,
  expiresAt: new Date(Date.now() + 60_000), marca: { nombre: 'M' }, rol: { nombre: 'ventas' },
};

describe('InvitacionesService.aceptar', () => {
  let prisma: any;
  let service: InvitacionesService;

  beforeEach(() => {
    prisma = {
      invitacion: { findUnique: vi.fn().mockResolvedValue(vigente), update: vi.fn() },
      usuario: { findUnique: vi.fn(), create: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }) },
      usuarioMarcaRol: { upsert: vi.fn() },
    };
    service = new InvitacionesService(prisma, {} as never);
  });

  it('exige contraseña si la cuenta no existe', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    await expect(service.aceptar({ token: 't' })).rejects.toThrow('contraseña');
  });

  it('crea la cuenta, asigna rol y marca la invitación como aceptada', async () => {
    prisma.usuario.findUnique.mockResolvedValue(null);
    await service.aceptar({ token: 't', password: 'password-largo' });
    expect(prisma.usuarioMarcaRol.upsert).toHaveBeenCalled();
    expect(prisma.invitacion.update.mock.calls[0][0].data.aceptadaAt).toBeInstanceOf(Date);
  });

  it('rechaza invitaciones vencidas', async () => {
    prisma.invitacion.findUnique.mockResolvedValue({ ...vigente, expiresAt: new Date(0) });
    await expect(service.aceptar({ token: 't', password: 'password-largo' })).rejects.toThrow('venció');
  });
});
