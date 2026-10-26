# Política de seguridad

## Reporte de vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en FPTecnologi-HUB, repórtala de
forma privada usando [GitHub Security Advisories](../../security/advisories/new)
en este repositorio (pestaña **Security → Advisories → Report a vulnerability**).

No abras un issue público para vulnerabilidades — podría exponer el problema
antes de tener un fix disponible.

Incluye, si es posible:
- Descripción del problema y su impacto.
- Pasos para reproducirlo (endpoint, payload, rol/usuario usado).
- Versión/commit afectado.

Intentaremos confirmar la recepción en un plazo razonable y coordinar un fix
antes de hacer pública cualquier información.

## Qué cubre este repo

- `apps/api`: API central (NestJS + Prisma). Autenticación JWT + Refresh
  Token + OTP, autorización por `marcaId` vía `MarcaRolGuard`.
- `apps/admin`: Dashboard administrativo (Next.js).
- `apps/web-fptecnologi`, `apps/fimav-web`, `apps/quamtu-web`: webs públicas
  (Next.js); cada una se publica además en su repo espejo.

## Versiones y parches

- Next.js **16.4.1 o superior** en las 4 apps Next (hoy 16.4.3). Las
  16.0.0–16.4.0 tienen una ejecución remota de código sin login en la
  optimización de imágenes.
- `npm audit` debe dar **0 vulnerabilidades** en las 5 apps. Lo que no
  corrige `npm audit fix` se fuerza con `overrides` en el `package.json` de
  cada app. Última revisión completa: 2026-10-25 (ver
  `docs/ESTADO-ACTUAL.md`).
- Node.js 22 en CI y en el hosting.

## Protecciones en el código

- API: `helmet`, CORS solo al dashboard (`WEB_ORIGIN`), `ValidationPipe`
  con `whitelist` + `forbidNonWhitelisted`, tope de peticiones por IP,
  validación de secretos al arrancar, Swagger con Basic Auth en producción,
  tenant-guard de Prisma (ninguna consulta sin `marcaId`), subidas
  validadas por la firma real del archivo (SVG rechazado).
- Apps Next: cabeceras `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS y sin `X-Powered-By`. El dashboard no se puede
  incrustar en otra web (`X-Frame-Options: DENY`); las webs solo dentro de
  sí mismas y del dashboard (`frame-ancestors`, `DASHBOARD_ORIGIN`).

## Automatización de seguridad activa

- **CodeQL** (`.github/workflows/codeql.yml`): análisis estático de
  JavaScript/TypeScript en cada push/PR a `main` y semanalmente.
- **Dependabot** (`.github/dependabot.yml`): actualizaciones automáticas de
  dependencias npm de las 5 apps y de GitHub Actions, semanales.
- **Dependency Audit** (`.github/workflows/dependency-audit.yml`):
  `npm audit` de las 5 apps en cada push/PR y semanalmente (informativo).
- **CI** (`.github/workflows/ci.yml`): API (lint, build y tests) y las 4
  apps Next (tipos y build) en cada push/PR a `main`.

## Recomendaciones de configuración del repositorio (requieren rol admin)

Estas no se pueden aplicar desde código, se configuran en
**Settings → Code security** y **Settings → Branches**:

- Activar *Dependabot alerts* y *Dependabot security updates*.
- Activar *Secret scanning* + *Push protection*.
- Activar *Code scanning* (ya alimentado por el workflow de CodeQL).
- Configurar una *branch protection rule* sobre `main`: requerir que pasen
  los checks `api (build · lint · test)`, `admin (tipos · build)`,
  `web-fptecnologi (tipos · build)`, `fimav-web (tipos · build)` y
  `quamtu-web (tipos · build)` antes de
  mergear, y requerir al menos 1 revisión de PR.
