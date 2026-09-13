import { Injectable, type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

/**
 * Wraps passport's 'google' strategy just to forward `?marcaId=` as the
 * OAuth `state` param — Google round-trips it back untouched to the
 * callback, which is how we know which marca a NEW account should join
 * (an existing account ignores it and just logs in).
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // Constructor propio (aunque no agregue nada) para que Nest resuelva bien
  // las dependencias del mixin AuthGuard() — sin esto, una subclase sin
  // constructor propio pierde los metadatos de inyección de la clase base
  // y Nest tira UnknownDependenciesException buscando AuthModuleOptions.
  constructor() {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const marcaId = typeof req.query.marcaId === 'string' ? req.query.marcaId : undefined;
    return { state: marcaId ?? '' };
  }
}
