-- Índices redundantes (el compuesto que empieza por la misma columna ya los cubre): menos escritura y espacio.
DROP INDEX IF EXISTS "Pedido_marcaId_idx";
DROP INDEX IF EXISTS "Cotizacion_marcaId_idx";
DROP INDEX IF EXISTS "Categoria_marcaId_idx";
DROP INDEX IF EXISTS "Servicio_marcaId_idx";
DROP INDEX IF EXISTS "TarifaEnvio_marcaId_idx";
DROP INDEX IF EXISTS "ChatAsesor_marcaId_idx";
DROP INDEX IF EXISTS "Notificacion_usuarioId_idx";

-- Listados del dashboard filtrados por estado y ordenados por fecha; conteo de notificaciones sin leer.
CREATE INDEX IF NOT EXISTS "Pedido_marcaId_estado_createdAt_idx" ON "Pedido"("marcaId", "estado", "createdAt");
CREATE INDEX IF NOT EXISTS "Cotizacion_marcaId_estado_createdAt_idx" ON "Cotizacion"("marcaId", "estado", "createdAt");
CREATE INDEX IF NOT EXISTS "Presupuesto_marcaId_estado_createdAt_idx" ON "Presupuesto"("marcaId", "estado", "createdAt");
CREATE INDEX IF NOT EXISTS "Notificacion_usuarioId_leida_idx" ON "Notificacion"("usuarioId", "leida");

-- Búsqueda de la tienda (ILIKE %texto%): índices trigram. Prisma no los modela; viven solo en SQL.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "Producto_nombre_trgm_idx" ON "Producto" USING gin ("nombre" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Producto_sku_trgm_idx" ON "Producto" USING gin ("sku" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Producto_marcaComercial_trgm_idx" ON "Producto" USING gin ("marcaComercial" gin_trgm_ops);
