import { ForbiddenException, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.js';

/**
 * Authorization guard: verifies the authenticated user has a role assigned
 * for the marca being requested (`x-marca-id` header or `marcaId` query
 * param), and — when @Roles(...) is present — that the role is allowed.
 * This is the single choke point other modules rely on instead of trusting
 * any marcaId the frontend sends.
 */
@Injectable()
export class MarcaRolGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>();
    const user = request.user;
    const marcaId =
      (request.headers['x-marca-id'] as string | undefined) ??
      (request.query?.marcaId as string | undefined);

    if (!user || !marcaId) {
      throw new ForbiddenException('No se pudo determinar la marca activa');
    }

    const asignacion = user.marcas.find((m) => m.marcaId === marcaId);
    if (!asignacion) {
      throw new ForbiddenException('No tienes acceso a esta marca');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(asignacion.rol)) {
      throw new ForbiddenException('Tu rol en esta marca no permite esta acción');
    }

    return true;
  }
}
