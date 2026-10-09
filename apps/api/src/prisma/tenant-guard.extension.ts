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
 *
 * `UsuarioMarcaRol` gets one extra allowance: a query scoped by `usuarioId`
 * (no `marcaId`) also passes. That's exactly how "which marcas does this
 * user belong to" (the marca-switcher's `/usuarios/me/marcas`) has to be
 * queried — it's deliberately cross-marca for that one user, and it can't
 * leak another user's rows since it's still pinned to a single usuarioId.
 *
 * `Sitio` has the same kind of allowance for `dominio` (globally unique):
 * `GET /sitios/resolver/:dominio` is how a public web discovers *which*
 * marca it is, so it cannot know the marcaId beforehand.
 */
const TENANT_MODELS = new Set([
  'Sitio',
  'Categoria',
  'Producto',
  'Pedido',
  'Servicio',
  'Cotizacion',
  'UsuarioMarcaRol',
  'ChatAsesor',
  'ChatConversacion',
  'ChatMensaje',
  'ContenidoWeb',
  'BlogArticulo',
  'LeadCotizador',
  'ContactoWeb',
  'Ticket',
  'TicketMensaje',
  'Socio',
  'Recurso',
  'SuscriptorBoletin',
  'TarifaEnvio',
  'CotizacionEnvio',
  'Campana',
  'Landing',
  'LandingRegistro',
  'CodigoCuenta',
  'ConocimientoDocumento',
  'ConocimientoFragmento',
  'ConocimientoPendiente',
  'Proyecto',
  'Cliente',
  'Popup',
  'TarjetaDigital',
  'Presupuesto',
]);

/** Models whose where may be pinned by this key instead of marcaId (see above). */
const UNSCOPED_LOOKUP_KEY: Record<string, string> = {
  UsuarioMarcaRol: 'usuarioId',
  Sitio: 'dominio',
};

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
  return hasKey(value, 'marcaId', depth);
}

/** Same recursive-key search as hasMarcaId, generalized for the UsuarioMarcaRol usuarioId allowance. */
export function hasKey(value: unknown, targetKey: string, depth = 0): boolean {
  if (!value || typeof value !== 'object' || depth > 1) return false;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (key === targetKey) return true;
    if ((key === 'AND' || key === 'OR') && Array.isArray(nested)) {
      if (nested.some((item) => hasKey(item, targetKey, depth + 1))) return true;
    } else if (hasKey(nested, targetKey, depth + 1)) {
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

          const lookupKey = UNSCOPED_LOOKUP_KEY[model];
          const pinnedLookup = !!lookupKey && hasKey(typedArgs.where, lookupKey);
          if (WHERE_OPS.has(operation) && !hasMarcaId(typedArgs.where) && !pinnedLookup) {
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
