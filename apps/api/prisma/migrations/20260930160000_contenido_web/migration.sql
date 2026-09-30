-- CreateTable
CREATE TABLE "ContenidoWeb" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "pagina" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "actualizadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContenidoWeb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContenidoWeb_marcaId_pagina_idx" ON "ContenidoWeb"("marcaId", "pagina");

-- CreateIndex
CREATE UNIQUE INDEX "ContenidoWeb_marcaId_pagina_seccion_key" ON "ContenidoWeb"("marcaId", "pagina", "seccion");

-- AddForeignKey
ALTER TABLE "ContenidoWeb" ADD CONSTRAINT "ContenidoWeb_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

