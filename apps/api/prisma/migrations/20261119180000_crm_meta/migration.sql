-- CreateTable
CREATE TABLE "CrmMeta" (
    "id" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "periodo" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmMeta_marcaId_periodo_idx" ON "CrmMeta"("marcaId", "periodo");

-- CreateIndex
CREATE INDEX "CrmMeta_usuarioId_periodo_idx" ON "CrmMeta"("usuarioId", "periodo");

-- Una sola meta por marca, periodo, moneda y comercial (o la de la marca entera cuando usuarioId es nulo).
CREATE UNIQUE INDEX "CrmMeta_unica_idx" ON "CrmMeta"("marcaId", COALESCE("usuarioId", ''), "periodo", "moneda");

-- AddForeignKey
ALTER TABLE "CrmMeta" ADD CONSTRAINT "CrmMeta_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmMeta" ADD CONSTRAINT "CrmMeta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
