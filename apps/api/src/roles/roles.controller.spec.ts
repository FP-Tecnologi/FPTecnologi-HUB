import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { RolesController } from './roles.controller.js';

describe('RolesController.equipoDeMarca', () => {
  it('rechaza pedir el equipo de una marca distinta a la activa (x-marca-id)', () => {
    const equipoDeMarca = vi.fn();
    const controller = new RolesController({ equipoDeMarca } as never);
    expect(() => controller.equipoDeMarca('m1', 'm2')).toThrow(ForbiddenException);
    expect(equipoDeMarca).not.toHaveBeenCalled();
  });

  it('devuelve el equipo cuando la marca de la URL coincide con la activa', () => {
    const equipoDeMarca = vi.fn().mockReturnValue([]);
    const controller = new RolesController({ equipoDeMarca } as never);
    controller.equipoDeMarca('m1', 'm1');
    expect(equipoDeMarca).toHaveBeenCalledWith('m1');
  });
});
