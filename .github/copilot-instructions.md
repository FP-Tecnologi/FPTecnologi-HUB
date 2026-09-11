# Instrucciones para GitHub Copilot

Contexto completo del proyecto (arquitectura, stack, módulos, convenciones,
estado actual) vive en [`AGENTS.md`](../AGENTS.md) en la raíz del repo —
léelo antes de generar o modificar código.

Reglas rápidas que aplican también a sugerencias de Copilot:
- No inventar infraestructura separada por marca — todo pasa por
  `marcaId` en la misma API/base de datos.
- No confiar en un `marcaId` que venga del cliente sin validar contra
  `MarcaRolGuard`/JWT.
- Antes de un componente nuevo en `apps/web`, revisar
  [`VIREO-REFERENCE.md`](../VIREO-REFERENCE.md) por si ya existe un patrón.
- npm en todo el repo (no pnpm/yarn).
