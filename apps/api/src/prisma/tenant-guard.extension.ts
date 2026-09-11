import { Prisma } from '../generated/prisma/client.js';

/**
 * Multi-tenant safety net: throws if a query against a marca-scoped model
 * runs without `marcaId` anywhere in its `where`/`data`. MarcaRolGuard only
 * checks the caller has access to the marcaId they *claim* — it can't see
 * whether the service method that runs afterwards actually used it. Every
 * current query already includes marcaId (verified), so this only fires on
 * a real future mistake — a query that would otherwise leak/mutate another
 * marca's rows.
 *
 * `Notificacion` is deliberately excluded: its marcaId is nullable
 * (user-level notifications aren't tied to a marca) and it's scoped by
 * usuarioId instead. `upsert` is excluded too — its where/create/update
 * split isn't covered by the same shape check as the rest and no current
 * code uses it on a tenant model; add it deliberately if that changes.
 */
const TENANT_MODELS = new Set([
  'Sitio',
  'Categoria',
  'Producto',
  'Pedido',
  'Servicio',
  'Cotizacion',
  'UsuarioMarcaRol',
]);

const WHERE_OPS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'findUnique',
  'findUniqueOrThrow',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
]);

const DATA_OPS = new Set(['create', 'createMany']);

export function hasMarcaId(value: unknown, depth = 0): boolean {
  if (!value || typeof value !== 'object' || depth > 1) return false;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'marcaId') return true;
    if ((key === 'AND' || key === 'OR') && Array.isArray(nested)) {
      if (nested.some((item) => hasMarcaId(item, depth + 1))) return true;
    } else if (hasMarcaId(nested, depth + 1)) {
      return true;
    }
  }
  return false;
}

export const tenantGuardExtension = Prisma.defineExtension({
  name: 'tenant-guard',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (model && TENANT_MODELS.has(model)) {
          const typedArgs = args as { where?: unknown; data?: unknown };

          if (WHERE_OPS.has(operation) && !hasMarcaId(typedArgs.where)) {
            throw new Error(
              `[tenant-guard] ${model}.${operation} sin marcaId en el where — ` +
                'rompe el aislamiento multi-tenant. Agrega marcaId al filtro.',
            );
          }

          if (DATA_OPS.has(operation)) {
            const items = Array.isArray(typedArgs.data) ? typedArgs.data : [typedArgs.data];
            if (items.some((item) => !hasMarcaId(item))) {
              throw new Error(
                `[tenant-guard] ${model}.${operation} sin marcaId en data — ` +
                  'el registro quedaría sin dueño de marca.',
              );
            }
          }
        }
        return query(args);
      },
    },
  },
});
