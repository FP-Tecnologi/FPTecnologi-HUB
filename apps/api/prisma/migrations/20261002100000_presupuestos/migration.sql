-- Presupuestos de productos para clientes mayoristas + precio mayorista por producto. Aditivo e idempotente.
ALTER TABLE "Producto" ADD COLUMN IF NOT EXISTS "precioMayorista" DECIMAL(65,30);

CREATE TABLE IF NOT EXISTS "Presupuesto" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "estado" "EstadoCotizacion" NOT NULL DEFAULT 'PENDIENTE',
    "clienteNombre" TEXT NOT NULL,
    "clienteDocumento" TEXT,
    "clienteEmail" TEXT NOT NULL,
    "clienteTelefono" TEXT,
    "clienteDireccion" TEXT,
    "notas" TEXT,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "subtotal" DECIMAL(65,30) NOT NULL,
    "igv" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "validezHasta" TIMESTAMP(3) NOT NULL,
    "origen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PresupuestoItem" (
    "id" TEXT NOT NULL,
    "presupuestoId" TEXT NOT NULL,
    "productoId" TEXT,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioLista" DECIMAL(65,30) NOT NULL,
    "precioUnitario" DECIMAL(65,30) NOT NULL,
    "mayorista" BOOLEAN NOT NULL DEFAULT false,
    "subtotal" DECIMAL(65,30) NOT NULL,
    CONSTRAINT "PresupuestoItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Presupuesto_marcaId_numero_key" ON "Presupuesto"("marcaId", "numero");
CREATE INDEX IF NOT EXISTS "Presupuesto_marcaId_createdAt_idx" ON "Presupuesto"("marcaId", "createdAt");
CREATE INDEX IF NOT EXISTS "PresupuestoItem_presupuestoId_idx" ON "PresupuestoItem"("presupuestoId");

ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PresupuestoItem" ADD CONSTRAINT "PresupuestoItem_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
