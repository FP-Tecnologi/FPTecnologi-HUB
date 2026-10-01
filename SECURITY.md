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

## Automatización de seguridad activa

- **CodeQL** (`.github/workflows/codeql.yml`): análisis estático de
  JavaScript/TypeScript en cada push/PR a `main` y semanalmente.
- **Dependabot** (`.github/dependabot.yml`): actualizaciones automáticas de
  dependencias npm (`apps/api`, `apps/admin`) y de GitHub Actions, semanales.
- **Dependency Audit** (`.github/workflows/dependency-audit.yml`):
  `npm audit` en cada push/PR y semanalmente (informativo).
- **CI** (`.github/workflows/ci.yml`): build, lint y tests en cada push/PR
  a `main`.

## Recomendaciones de configuración del repositorio (requieren rol admin)

Estas no se pueden aplicar desde código, se configuran en
**Settings → Code security** y **Settings → Branches**:

- Activar *Dependabot alerts* y *Dependabot security updates*.
- Activar *Secret scanning* + *Push protection*.
- Activar *Code scanning* (ya alimentado por el workflow de CodeQL).
- Configurar una *branch protection rule* sobre `main`: requerir que pasen
  los checks `api (build · lint · test)` y `web (build · lint)` antes de
  mergear, y requerir al menos 1 revisión de PR.
