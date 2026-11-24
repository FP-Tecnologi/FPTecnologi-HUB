import { describe, expect, it, vi } from 'vitest';
import { PublicChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';

const servicio = (perfilDeLaPersona: { id: string } | null, esMiembro = true) => {
  const update = vi.fn();
  const prisma = {
    chatAsesor: { findFirst: vi.fn(async ({ where }: { where: { id?: string } }) => (where.id ? { id: where.id } : perfilDeLaPersona)), update },
    usuarioMarcaRol: { findFirst: vi.fn(async () => (esMiembro ? { id: 'r' } : null)) },
  };
  return { chat: new ChatService(prisma as never, {} as never), update };
};

describe('asesores', () => {
  it('al editar no deja vincular a alguien de otra marca ni duplicar su perfil', async () => {
    await expect(servicio(null, false).chat.updateAsesor('m1', 'a1', { usuarioId: 'u' })).rejects.toThrow('no pertenece');
    await expect(servicio({ id: 'a2' }).chat.updateAsesor('m1', 'a1', { usuarioId: 'u' })).rejects.toThrow('ya es asesora');
  });

  it('deja guardar el perfil que ya era de esa persona', async () => {
    const { chat, update } = servicio({ id: 'a1' });
    await chat.updateAsesor('m1', 'a1', { usuarioId: 'u' });
    expect(update).toHaveBeenCalled();
  });

  it('la lista pública exige marcaId', async () => {
    await expect(new PublicChatController({} as never).asesores(undefined as never)).rejects.toThrow('marcaId');
  });
});
