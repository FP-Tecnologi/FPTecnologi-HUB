import type { NextFunction, Request, Response } from 'express';

/**
 * Gates /docs (+ /docs-json, /docs-yaml — SwaggerModule registers those as
 * sibling routes, not sub-paths, so this must be mounted globally and
 * check req.path itself rather than relying on app.use('/docs', ...)
 * prefix matching) behind HTTP Basic Auth in production. Swagger's routes
 * bypass Nest's guard stack entirely (SwaggerModule.setup wires them
 * directly on the underlying HTTP adapter), so without this the full API
 * schema — every route, every DTO shape — is public to anyone who finds
 * the URL. Left open in development for convenience; required in
 * production via SWAGGER_USER/SWAGGER_PASSWORD (checked by
 * assertRequiredEnv).
 */
export function swaggerBasicAuth(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== 'production' || !req.path.startsWith('/docs')) {
    next();
    return;
  }

  const header = req.headers.authorization;
  const [user, password] = header?.startsWith('Basic ')
    ? Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8').split(':')
    : [];

  if (user === process.env.SWAGGER_USER && password === process.env.SWAGGER_PASSWORD) {
    next();
    return;
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="docs"');
  res.status(401).send('Unauthorized');
}
