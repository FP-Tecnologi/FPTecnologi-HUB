import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';

const CACHE_MS = 15_000;

/**
 * Super administrador = usuario con la marca `superAdmin` (Usuario.superAdmin). Es el único rol que ve y usa
 * Administración (usuarios de todas las marcas, marcas, actividad, soporte). Ser admin de una marca no basta.
 * Se asigna y se quita desde Administración → Usuarios. Usar después de JwtAuthGuard.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  private readonly cache = new Map<string, { at: number; ok: boolean }>();

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>().user;
    if (!user) throw new ForbiddenException('Sin sesión');
    const hit = this.cache.get(user.sub);
    let ok: boolean;
    if (hit && Date.now() - hit.at < CACHE_MS) ok = hit.ok;
    else {
      const u = await this.prisma.usuario.findUnique({ where: { id: user.sub }, select: { superAdmin: true, activo: true } });
      ok = !!u?.superAdmin && u.activo;
      this.cache.set(user.sub, { at: Date.now(), ok });
    }
    if (!ok) throw new ForbiddenException('Solo el super administrador puede hacer esto');
    return true;
  }
}
