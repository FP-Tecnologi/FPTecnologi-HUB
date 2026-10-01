import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';

const CACHE_MS = 30_000;

/**
 * Super admin = usuario con rol `admin` en TODAS las marcas existentes. No hay un rol aparte: se deduce de las
 * asignaciones, así que no hay nada que migrar ni un rol "especial" que pueda quedar suelto. Protege lo que cruza
 * marcas (alta/baja de marcas, listado global de usuarios). Usar después de JwtAuthGuard.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  private cache: { at: number; ids: string[] } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>().user;
    if (!user) throw new ForbiddenException('Sin sesión');
    if (!this.cache || Date.now() - this.cache.at > CACHE_MS) {
      const marcas = await this.prisma.marca.findMany({ select: { id: true } });
      this.cache = { at: Date.now(), ids: marcas.map((m) => m.id) };
    }
    const admin = new Set(user.marcas.filter((m) => m.rol === 'admin').map((m) => m.marcaId));
    if (this.cache.ids.length === 0 || !this.cache.ids.every((id) => admin.has(id))) {
      throw new ForbiddenException('Solo el super administrador (admin de todas las marcas) puede hacer esto');
    }
    return true;
  }
}
