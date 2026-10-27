import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.js';
import { rolesTickets } from './tickets.roles.js';

/**
 * Después de MarcaRolGuard (que ya comprobó que el usuario pertenece a la marca): el rol del usuario en esa marca debe
 * estar entre los que atienden sus tickets (tickets.roles.ts).
 */
@Injectable()
export class TicketsRolGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    const marcaId = (req.headers['x-marca-id'] as string | undefined) ?? (req.query?.marcaId as string | undefined);
    const rol = req.user?.marcas.find((m) => m.marcaId === marcaId)?.rol;
    if (!marcaId || !rol) throw new ForbiddenException('No tienes acceso a esta marca');
    const marca = await this.prisma.marca.findUnique({ where: { id: marcaId }, select: { nombre: true } });
    if (!rolesTickets(marca?.nombre).includes(rol)) throw new ForbiddenException('Tu rol en esta marca no atiende tickets');
    return true;
  }
}
