import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Resolves the "active marca" for the current request. Precedence:
 *   1. `x-marca-id` header (set by the dashboard once the user picks a brand)
 *   2. `marcaId` query param (used by public endpoints)
 * The MarcaRolGuard is responsible for verifying the user actually has
 * access to this marcaId — this decorator only extracts the raw value.
 */
export const MarcaActual = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const marcaId =
    (request.headers['x-marca-id'] as string | undefined) ??
    (request.query?.marcaId as string | undefined);

  if (!marcaId) {
    throw new BadRequestException('Falta el encabezado x-marca-id o el parámetro marcaId');
  }
  return marcaId;
});
