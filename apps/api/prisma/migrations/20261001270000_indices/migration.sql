-- Índices para las consultas más frecuentes (listados por marca ordenados por fecha, búsquedas por correo,
-- relaciones de pedidos y filtros de la tienda). Postgres NO indexa solas las llaves foráneas.
-- Aditivo e idempotente.
CREATE INDEX IF NOT EXISTS "Pedido_marcaId_createdAt_idx" ON "Pedido"("marcaId", "createdAt");
CREATE INDEX IF NOT EXISTS "Pedido_marcaId_email_idx" ON "Pedido"("marcaId", "email");
CREATE INDEX IF NOT EXISTS "PedidoItem_pedidoId_idx" ON "PedidoItem"("pedidoId");
CREATE INDEX IF NOT EXISTS "PedidoItem_productoId_idx" ON "PedidoItem"("productoId");
CREATE INDEX IF NOT EXISTS "Cotizacion_marcaId_createdAt_idx" ON "Cotizacion"("marcaId", "createdAt");
CREATE INDEX IF NOT EXISTS "Notificacion_usuarioId_createdAt_idx" ON "Notificacion"("usuarioId", "createdAt");
CREATE INDEX IF NOT EXISTS "Producto_marcaId_activo_categoriaId_idx" ON "Producto"("marcaId", "activo", "categoriaId");
