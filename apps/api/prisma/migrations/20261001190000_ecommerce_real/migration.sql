-- Ecommerce real fase 1: catálogo comprable (slug, imágenes, marca, oferta,
-- destacado, moneda) + snapshot de venta en pedidos. Todo aditivo con
-- defaults para que las filas existentes sigan válidas. IF NOT EXISTS para
-- poder aplicarlo a mano en Supabase sin miedo a re-ejecuciones.
-- No rompe el tenant-guard: no crea modelos nuevos, solo columnas.

-- Categoria: slug/orden/activo/portada
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "orden" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Categoria" ADD COLUMN IF NOT EXISTS "portadaUrl" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Categoria_marcaId_slug_key" ON "Categoria"("marcaId", "slug");

-- Producto: slug, oferta, moneda, marca del fabricante, imágenes, destacado
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "precioAntes" DECIMAL(65,30);
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "moneda" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "marcaComercial" TEXT;
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "imagenes" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "destacado" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "Producto_marcaId_slug_key" ON "Producto"("marcaId", "slug");

-- Pedido: correlativo + datos del comprador invitado + desglose + pago
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "numeroPedido" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "nombre" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "celular" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "documento" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "direccion" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "distrito" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "notas" TEXT;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "igv" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "envio" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "descuento" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "moneda" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "estadoPago" TEXT NOT NULL DEFAULT 'PENDIENTE';
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "metodoPago" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Pedido_marcaId_numeroPedido_key" ON "Pedido"("marcaId", "numeroPedido");

-- PedidoItem: snapshot de la venta (la factura no cambia si el producto cambia)
ALTER TABLE "PedidoItem" ADD COLUMN IF NOT EXISTS "nombreSnapshot" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PedidoItem" ADD COLUMN IF NOT EXISTS "skuSnapshot" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PedidoItem" ADD COLUMN IF NOT EXISTS "igvUnitario" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "PedidoItem" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0;
