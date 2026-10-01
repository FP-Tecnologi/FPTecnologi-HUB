import { describe, expect, it, vi } from 'vitest';
import { CotizacionesService } from './cotizaciones.service.js';

const base = {
  id: 'c1', numero: 'COT-2026-ABC123', estado: 'PENDIENTE', clienteNombre: 'Ana', clienteEmail: 'ana@x.com', clienteTelefono: '987654321',
  propuesta: 'Instalación de 8 cámaras', monto: 1200, moneda: 'USD', validezHasta: null, servicio: { id: 's1', nombre: 'Seguridad ciudadana' }, envios: [],
};

function setup(cot: Record<string, unknown> = base) {
  const prisma = {
    cotizacion: { findFirst: vi.fn(async () => cot), updateMany: vi.fn(async (_a: { data: Record<string, unknown> }) => ({ count: 1 })) },
    cotizacionEnvio: { create: vi.fn(async (_a: unknown) => ({})) },
  };
  const mail = { sendCotizacionServicio: vi.fn(async () => {}) };
  return { service: new CotizacionesService(prisma as never, mail as never), prisma, mail };
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
    expect(mail.sendCotizacionServicio).toHaveBeenCalledWith('ana@x.com', expect.objectContaining({ numero: 'COT-2026-ABC123', monto: 'USD 1,200.00' }));
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
